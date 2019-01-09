---
title: 2016微软探星 | Constraint Checker
date: 2016-08-04 10:56:12
tags: [算法]
categories:
  - 工作
  - ACM
thumbnail: http://upload-images.jianshu.io/upload_images/2641798-0227972e7244b9eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240
---

题目来源于 2016 年微软探星夏令营在线技术笔试，笔试结果是作为甄选微软 2016 校招技术类职位的重要参考之一。这个考试对于想进微软实习或工作的在校生来说还是蛮重要的。
本人闲来无聊也注册了帐号尝试了第一题，代码用 C++实现，比较乱，侥幸一次通过。下面直接看一下考题。

<!-- more -->

![](http://upload-images.jianshu.io/upload_images/2641798-0227972e7244b9eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

---

题目：

时间限制:10000ms
单点时限:1000ms
内存限制:256MB

描述
Given a set of constraints like **0<N<=M<=100** and values for all the variables, write a checker program to determine if the constraints are satisfied.
More precisely, the format of constraints is:
**token op token op ... op token**
where each token is either a constant integer or a variable represented by a capital letter and each op is either less-than ( < ) or less-than-or-equal-to ( <= ). 
输入
The first line contains an integer N, the number of constraints. (1 ≤ N≤ 20)
Each of the following N lines contains a constraint in the previous mentioned format.
Then follows an integer T, the number of assignments to check. (1 ≤ T≤ 50)
Each assignment occupies K lines where K is the number of variables in the constraints.
Each line contains a capital letter and an integer, representing a variable and its value.
It is guaranteed that:

1. Every token in the constraints is either an integer from 0 to 1000000 or an variable represented by a capital letter from 'A' to 'Z'.
2. There is no space in the constraints.
3. In each assignment every variable appears exactly once and its value is from 0 to 1000000. 
   输出
   For each assignment output Yes or No indicating if the constraints are satisfied.

> 样例输入
> 2
> A<B<=E
> 3<=E<5
> 2
> A 1
> B 2
> E 3
> A 3
> B 5
> E 10

> 样例输出
> Yes
> No

解释：
这道题题目还是比较容易理解，就是根据输入的若干个不等式，校验后面输入的数据是否都满足前面的不等式，满足就输出 Yes，只要有一个不满足就输出 No。如“A<B<=E，3<=E<5”这个两个关系式，对于输入 A ＝ 1，B ＝ 2，E ＝ 3 肯定满足，因为 1<2<=3，3<=3<5。而 A ＝ 3, B ＝ 5，E=10 就不满足，因为 3<=10<5 不成立。

分析：
1、由于有所有不等式都要通过校验才输出 Yes，那么代表我们要在输入的时候就将所有不等式关系都存起来方便后面校验，这里我用了一个 vector 来存储这些关系，后面校验的时候遍历 vector 里面所有的值，一个个校验。
2、由于每个不等式关系只有"<"或者"<="，说明这个关系是递增的，所以我用了 multimap<int，string>来存储这种关系（multimap 对于 key 是自增长排序，并且可以存储相同的 key）。来看看我对关系式的一个转换函数：

```
multimap<int,string> convertStrToMap(string operation)
{
    multimap<int,string> mapOp;
    size_t len = operation.length();
    int rank = 0;
    int prior = 0;
    for (int i = 0; i < len; i++) {
        char letter = operation[i];
        if (letter == '<') {
            string str = operation.substr(prior, i - prior);
            mapOp.insert(make_pair(rank, str));
            if (i - prior == 1) {
                if (str[0] >= 'A' && str[0] <= 'Z') {
                    varMap.insert(make_pair(str[0], 0));
                }
            }
            prior = i + 1;
            rank++;
        }
        if (letter == '=') {
            prior = i + 1;
            rank--;
        }
    }
    string str = operation.substr(prior, len - prior);
    mapOp.insert(make_pair(rank, str));
    if (len - prior == 1) {
        if (str[0] >= 'A' && str[0] <= 'Z') {
            varMap.insert(make_pair(str[0], 0));
        }
    }
    return mapOp;
}
```

返回的 mapOp 就是将 string 类型的关系式转换后的 multimap，这里的 key 是 int 类型代表该变量或者数字是在关系式什么层级，value 是 string 类型方便后面转换成数字进行比较。例如，A<B<=E，在 multimap 中会存为｛0:A,1:B,1:E｝。这段代码还有个 varMap 变量，它是一个全局变量，用来记录关系式中出现的变量（题目规定了变量只能够是 A－Z）。
3、最后就是输入数据，更新 varMap，然后根据关系式比较看是否满足，输出结果。代码：

```
int findValue(string input)
{
    if (input.size() == 1 && input[0] >= 'A' && input[0] <= 'Z') {
        return varMap[input[0]];
    }
    return atoi(input.c_str());
}

void checker(vector<multimap<int,string>> opVec)
{
    bool pass = true;
    for (int i = 0; i < opVec.size(); i++) {
        multimap<int,string> operation = opVec[i];
        multimap<int,string>::iterator it;
        int rank1 = -1, rank2 = -1;
        int value1, value2;
        string var1, var2;
        for (it = operation.begin(); it !=operation.end(); it++) {
            if (rank1 == -1) {
                rank1 = it->first;
                var1 = it->second;
                continue;
            }
            rank2 = it->first;
            var2 = it->second;
            value1 = findValue(var1);
            value2 = findValue(var2);
            if (rank1 == rank2) { // <=
                if (value1 <= value2) {
                    pass = true;
                }
                else
                {
                    pass = false;
                }
            }
            else // <
            {
                if (value1 < value2) {
                    pass = true;
                }
                else
                {
                    pass = false;
                }
            }
            
            if (!pass) {
                break;
            }
            
            var1 = var2;
            rank1 = rank2;
        }
        
        if (!pass) {
            break;
        }
    }
    
    if (pass) {
        cout<<"Yes"<<endl;
    }
    else
    {
        cout<<"No"<<endl;
    }
}
```

由于前面关系式已经按结构存储好了，所以只需要一步步比较校验即可。层级一样的变量，value 想等通过，层级不一样的，value1<value2 即可。

看一下判定结果：
![](http://upload-images.jianshu.io/upload_images/2641798-645fb746e176c24b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

完整代码：

```
//
//  main.cpp
//  Constraint Checker
//
//  Created by Jiao Liu on 7/18/16.
//  Copyright © 2016 ChangHong. All rights reserved.
//

#include <map>
#include <vector>
#include <string>
#include <stdio.h>
#include <iostream>

using namespace std;
map<char,int> varMap;

multimap<int,string> convertStrToMap(string operation)
{
    multimap<int,string> mapOp;
    size_t len = operation.length();
    int rank = 0;
    int prior = 0;
    for (int i = 0; i < len; i++) {
        char letter = operation[i];
        if (letter == '<') {
            string str = operation.substr(prior, i - prior);
            mapOp.insert(make_pair(rank, str));
            if (i - prior == 1) {
                if (str[0] >= 'A' && str[0] <= 'Z') {
                    varMap.insert(make_pair(str[0], 0));
                }
            }
            prior = i + 1;
            rank++;
        }
        if (letter == '=') {
            prior = i + 1;
            rank--;
        }
    }
    string str = operation.substr(prior, len - prior);
    mapOp.insert(make_pair(rank, str));
    if (len - prior == 1) {
        if (str[0] >= 'A' && str[0] <= 'Z') {
            varMap.insert(make_pair(str[0], 0));
        }
    }
    return mapOp;
}

int findValue(string input)
{

    if (input.size() == 1 && input[0] >= 'A' && input[0] <= 'Z') {
        return varMap[input[0]];
    }
    return atoi(input.c_str());
}

void checker(vector<multimap<int,string>> opVec)
{
    bool pass = true;
    for (int i = 0; i < opVec.size(); i++) {
        multimap<int,string> operation = opVec[i];
        multimap<int,string>::iterator it;
        int rank1 = -1, rank2 = -1;
        int value1, value2;
        string var1, var2;
        for (it = operation.begin(); it !=operation.end(); it++) {
            if (rank1 == -1) {
                rank1 = it->first;
                var1 = it->second;
                continue;
            }
            rank2 = it->first;
            var2 = it->second;
            value1 = findValue(var1);
            value2 = findValue(var2);
            if (rank1 == rank2) { // <=
                if (value1 <= value2) {
                    pass = true;
                }
                else
                {
                    pass = false;
                }
            }
            else // <
            {
                if (value1 < value2) {
                    pass = true;
                }
                else
                {
                    pass = false;
                }
            }

            if (!pass) {
                break;
            }

            var1 = var2;
            rank1 = rank2;
        }

        if (!pass) {
            break;
        }
    }

    if (pass) {
        cout<<"Yes"<<endl;
    }
    else
    {
        cout<<"No"<<endl;
    }
}

int main()
{
    int N;
    scanf("%d",&N);
    vector<multimap<int,string>> opVec;
    while (N--) {
        string op;
        cin >> op;
        multimap<int,string> operation = convertStrToMap(op);
        opVec.push_back(operation);
    }
    int T;
    scanf("%d",&T);
    while (T--) {
        size_t numOfVar = varMap.size();
        while (numOfVar--) {
            char letter;
            int value;
            cin>>letter>>value;
            varMap[letter] = value;
        }
        checker(opVec);
    }
    return 0;
}

```
