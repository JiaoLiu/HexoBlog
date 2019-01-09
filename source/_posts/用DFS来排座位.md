---
title: 用DFS来排座位
date: 2016-08-02 10:49:54
tags: [算法, GCJ]
categories:
  - 工作
  - ACM
thumbnail: http://upload-images.jianshu.io/upload_images/2641798-5ed96443e4c08337.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240
---

DFS（Depth-First-Search）深度优先算法，是搜索算法的一种。是一种在开发爬虫早期使用较多的方法。它的思想是从一个顶点 V0 开始，沿着一条路一直走到底，如果发现不能到达目标解，那就返回到上一个节点，然后从另一条路开始走到底，这种尽量往深处走的概念即是深度优先的概念。

深度优先搜索是图论中的经典算法，利用深度优先搜索算法可以产生目标图的相应拓扑排序表，利用拓扑排序表可以方便的解决很多相关的图论问题，如最大路径问题等等。

<!-- more -->

![DFS](http://upload-images.jianshu.io/upload_images/2641798-5ed96443e4c08337.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

下面以一个具体问题来看 DFS 的实现与实用。（问题来源[GCJ2016-1A]BFFs）

**Problem**
You are a teacher at the brand new Little Coders kindergarten. You have**N**kids in your class, and each one has a different student ID number from 1 through**N**. Every kid in your class has a single best friend forever (BFF), and you know who that BFF is for each kid. BFFs are not necessarily reciprocal -- that is, B being A's BFF does not imply that A is B's BFF.
Your lesson plan for tomorrow includes an activity in which the participants must sit in a circle. You want to make the activity as successful as possible by building the largest possible circle of kids such that each kid in the circle is sitting directly next to their BFF, either to the left or to the right. Any kids not in the circle will watch the activity without participating.
What is the greatest number of kids that can be in the circle?
**Input**
The first line of the input gives the number of test cases,**T**.**T**test cases follow. Each test case consists of two lines. The first line of a test case contains a single integer**N**, the total number of kids in the class. The second line of a test case contains**N**integers**F1**,**F2**, ...,**FN**, where**Fi**is the student ID number of the BFF of the kid with student ID i.
**Output**
For each test case, output one line containing "Case #x: y", where x is the test case number (starting from 1) and y is the maximum number of kids in the group that can be arranged in a circle such that each kid in the circle is sitting next to his or her BFF.
**Limits**
1 ≤**T**≤ 100.
1 ≤**Fi**≤**N**, for all i.
**Fi**≠ i, for all i. (No kid is their own BFF.)
**Small dataset**
3 ≤**N**≤ 10.
**Large dataset**
3 ≤**N**≤ 1000.
**Sample**

> Input
> 4
> 4
> 2 3 4 1
> 4
> 3 3 4 1
> 4
> 3 3 4 3
> 10
> 7 8 10 10 9 2 9 6 3 3
> Output
> Case #1: 4
> Case #2: 3
> Case #3: 3
> Case #4: 6

In sample case #4, the largest possible circle seats the following kids in the following order:7 9 3 10 4 1. (Any reflection or rotation of this circle would also work.) Note that the kid with student ID 1 is next to the kid with student ID 7, as required, because the list represents a circle.

解释：
一个幼儿园，有 N 个小朋友，编号从 1 到 N，每个孩子有一个永远最好的朋友。这个 BFF 不是相互的，A 是 B 的 BFF，不代表 B 也是 A 的的 BFF。接下来明天有节课需要小朋友坐成一个圈玩游戏，但是每个孩子都希望自己的左边或者右边坐的是自己的 BFF，没坐进去的小朋友就只能观看他们玩，那么这个圈最大能坐多少个小朋友？
输入第一个数 T 是测试数据的组数，然后每两行为一组，第一行一个数字是 N 小朋友的个数，第二行 N 个数字是编号 1 到 N 的孩子的最好朋友编号。
输出每行代表每组测试数据的最大圈坐小朋友数量。

分析：
第一步，我们需要找到每个孩子通过 BFF 这个关系单向能一共能链到多少孩子进来，这里就要用到 DFS 技术来实现。来看一下代码：

```
void dfs(int *input, bool *flag ,int start, NSMutableArray *array)
{
    if (flag[start - 1] == true) {
        return;
    }
    else
    {
        flag[start - 1] = true;
        [array addObject:[NSNumber numberWithInt:start]];
        start = input[start - 1];
        dfs(input, flag, start, array);
    }
}
```

这里 input 是 BFF 关系数组，flag 是标志某一个小孩是否访问过的数组，start 代表从哪个小孩开始搜索，array 是最后我们要的链。从 start 传入的小孩编号开始搜索，将 start 自己写到 array 中并标记为已访问，然后 start 更新为自己的 BFF，迭代调用 dfs，直到走到标记为已访问节点停止搜索。然后将分别从 1 到 N 编号的小孩为起点的形成的最长链的都存储起来。这里我们存在 chainArray 里面，方便后面使用。

第二步，我们用刚才保存的链来拼接环，这里我们用一个数组来记录以每个孩子为起点的最大环长度 circle，同时用一个整数 maxNum 记录所有的环中最大值。然后我们开始遍历刚才记录在 chainArray 里面的链，计算他们能拼接最长环的大小。计算中分三种情况：
1、链的最后一位小朋友的最好朋友不是第一位与倒数第二位小孩。如：1->2->3->4，但是 4 的 BFF 是 2，那么这种链就是无效的，也不能够成环，长度就记为 0；
2、链的最后一位小朋友的最好朋友是第一位小孩。如：1->2->3->4，4 的 BFF 是 1，那么这种链就是自成环，长度记为链长度 4。
3、链的最后一位小朋友的最好朋友是倒数第二位小孩。如：1->2->3->4，4 的 BFF 是 3，这种链既自成环，又可以和其它以 3 结尾的链拼接成环，如 5->4->3，两个链拼接后就成了 1->2->3<->4<-5。对于这种情况，我们就必须再次遍历所有链，找出和该链拼接后的最长链，记录为两链长度和减 2，并保存进 circle 中。
最后，每次更新过后环长度过后，需要更新 maxNum 的值。
实现代码如下：

```
    for (int j = 0; j < N; j++) {
        NSArray *array = [chainArray objectAtIndex:j];
        int length = (int)array.count;
        int LastIndex = [[array lastObject] intValue];
        int nextValue = input[LastIndex - 1];
        if (nextValue != [[array firstObject] intValue] && nextValue != [[array objectAtIndex:array.count - 2] intValue]) {
            length = 0;
        }
        else
        {
            if (nextValue == [[array objectAtIndex:array.count - 2] intValue]) {
                int MaxLength = 0;
                for (NSArray *item in chainArray) {
                    int newLength = 0;
                    if ([[item lastObject] intValue] == nextValue) {
                        newLength = length + (int)[item count] - 2;
                    }
                    MaxLength = MAX(MaxLength, newLength);
                }
                length = MaxLength;
                if (circle[nextValue - 1] < length) {
                    circle[nextValue - 1] = length;
                }
            }
        }
        
        maxNum = MAX(maxNum, length);
    }
```

至此，我们基本找到了以所有孩子为起点能形成的单一环，但是并不是能形成的最大环。

第三步，找出最大的环大小，上面的 maxNum 已经记录了单环所能得到的最大值，但是对于如 1->2->3<->4<-5 这种回环，其实还是可以和其它回环进行拼接，如和 6->7<->8<-9 拼接，最后得到更大的环 1->2->3<->4<-5\6->7<->8<-9。所以我们需要把刚才 circle 中记录的回环长度都加起来除以 2，再来更新 maxNum 得到最终的结果，代码如下：

```
    int tot = 0;
    for (int k = 0; k < N; k ++) {
        tot += circle[k];
    }
    maxNum = MAX(maxNum, tot / 2);
    return maxNum;
```

至此，我们就完美的利用 DFS 完成了对小朋友排座位的任务。
看一下输出判定结果：

> Small input
> 16 pointsSolve C-small
> Judge's response for last submission: Correct.
> Large input
> 29 pointsSolve C-large
> Judge's response for last submission: Correct.

完整代码：

```
//
//  main.m
//  BFFs
//
//  Created by Jiao Liu on 4/16/16.
//  Copyright © 2016 ChangHong. All rights reserved.
//

#import <Foundation/Foundation.h>

void dfs(int *input, bool *flag ,int start, NSMutableArray *array)
{
    if (flag[start - 1] == true) {
        return;
    }
    else
    {
        flag[start - 1] = true;
        [array addObject:[NSNumber numberWithInt:start]];
        start = input[start - 1];
        dfs(input, flag, start, array);
    }
}

long maxCircle(int *input, int N)
{
    long maxNum = 0;
    
    NSMutableArray *chainArray = [NSMutableArray array];
    int circle[N];
    memset(circle, 0, sizeof(circle));
    for (int i = 0; i < N; i++) {
        bool flag[N];
        memset(flag, false, sizeof(flag));
        NSMutableArray *array = [NSMutableArray array];
        dfs(input, flag, i + 1, array);
        [chainArray addObject:array];
    }
    
    for (int j = 0; j < N; j++) {
        NSArray *array = [chainArray objectAtIndex:j];
        int length = (int)array.count;
        int LastIndex = [[array lastObject] intValue];
        int nextValue = input[LastIndex - 1];
        if (nextValue != [[array firstObject] intValue] && nextValue != [[array objectAtIndex:array.count - 2] intValue]) {
            length = 0;
        }
        else
        {
            if (nextValue == [[array objectAtIndex:array.count - 2] intValue]) {
                int MaxLength = 0;
                for (NSArray *item in chainArray) {
                    int newLength = 0;
                    if ([[item lastObject] intValue] == nextValue) {
                        newLength = length + (int)[item count] - 2;
                    }
                    MaxLength = MAX(MaxLength, newLength);
                }
                length = MaxLength;
                if (circle[nextValue - 1] < length) {
                    circle[nextValue - 1] = length;
                }
            }
        }
        
        maxNum = MAX(maxNum, length);
    }
    
    int tot = 0;
    for (int k = 0; k < N; k ++) {
        tot += circle[k];
    }
    maxNum = MAX(maxNum, tot / 2);
    return maxNum;
}

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        // insert code here...
        freopen("/Users/Jiao/Desktop/CodeJam/BFFs/C-large-practice.in", "r", stdin);
//        freopen("/Users/Jiao/Desktop/CodeJam/BFFs/C-large-practice.out", "w", stdout);
        int T;
        scanf("%d",&T);
        for (int i = 1; i<=T; i++) {
            int N;
            scanf("%d",&N);
            int Bffs[N];
            for (int j = 0; j<N; j++) {
                int bestFriend;
                scanf("%d",&bestFriend);
                Bffs[j]=bestFriend;
            }
            printf("Case #%d: %ld\n",i,maxCircle(Bffs,N));
        }
    }
    return 0;
}
```
