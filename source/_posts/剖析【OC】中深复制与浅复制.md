---
title: 剖析【OC】中深复制与浅复制
date: 2016-08-22 10:58:02
tags: 移动端
categories:
  - 工作
  - iOS
thumbnail: http://upload-images.jianshu.io/upload_images/2641798-03dca550cc87313d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240
---

在 OC 编程中，常常会用到对对象的复制，然后操作副本对象。然而对与应该选择何种对象复制的方式，复制后副本对象操作会不会影响原始对象等问题，我们往往没有过多考虑，而是凭借经验在编码。接下来就对 OC 中对象复制机制进行剖析，通过对复制机制的研究可以在编码中对对象的复制更加游刃有余。

首先，在 OC 中复制分为深复制与浅复制，一个比较认可的定义是：

> **深复制：**复制对象引用与对象本身。 
> **浅复制：**只复制对象引用。

<!-- more -->

![](http://upload-images.jianshu.io/upload_images/2641798-03dca550cc87313d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

---

**那么哪些操作才是浅复制，哪些操作是深复制？**

所有的对象间赋值操作都是**浅复制**，仅仅复制了引用。如 CopyStr = Str1，这里 CopyStr 和 Str1 指向的同一内存地址，改变两者之间任何一个值，另一个都会随之改变。

试例代码：

```
void assignTest()
{
    printf("-----Assign Test-----\n\n");
    
    NSString *str1 = @"Hello";
    NSString *str2 = str1;
    printf("orignalStr : %s\n",[str1 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str2 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str1);
    printf("copyStr value address: %p\n",str2);
    printf("orignalStr pointer address: %p\n",&str1);
    printf("copyStr pointer address: %p\n",&str2);
    printf("\n");
    
    NSMutableString *str3 = [NSMutableString stringWithString:@"Hello"];
    NSMutableString *str4 = str3;
    [str3 appendString:@" World"];
    [str4 appendString:@"!"];
    printf("orignalStr : %s\n",[str3 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str4 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str3);
    printf("copyStr value address: %p\n",str4);
    printf("orignalStr pointer address: %p\n",&str3);
    printf("copyStr pointer address: %p\n",&str4);
    printf("\n");
    
    NSMutableArray *arr1 = [NSMutableArray arrayWithObjects:@"Hello", nil];
    NSMutableArray *arr2 = arr1;
    [arr1 addObject:@"World"];
    [arr2 addObject:@"!"];
    NSLog(@"orignalArray : %@",arr1);
    NSLog(@"copyArray : %@",arr2);
    printf("orignalArray value address: %p\n",arr1);
    printf("copyArray value address: %p\n",arr2);
    printf("orignalArray pointer address: %p\n",&arr1);
    printf("copyArray pointer address: %p\n",&arr2);
    printf("\n");
}
```

输出结果：

> **-----Assign Test-----**

---

**orignalStr : Hello**
**copyStr : Hello**
**orignalStr value address: 0x100002060**
**copyStr value address: 0x100002060**
**orignalStr pointer address: 0x7fff5fbff7a8**
**copyStr pointer address: 0x7fff5fbff7a0**

---

**orignalStr : Hello World!**
**copyStr : Hello World!**
**orignalStr value address: 0x1002005c0**
**copyStr value address: 0x1002005c0**
**orignalStr pointer address: 0x7fff5fbff798**
**copyStr pointer address: 0x7fff5fbff790**

---

**2016-08-22 11:35:20.312 CopyDemo[2046:72936] orignalArray : (**
**    Hello,**
**    World,**
**    "!"**
**)**
**2016-08-22 11:35:20.313 CopyDemo[2046:72936] copyArray : (**
**    Hello,**
**    World,**
**    "!"**
**)**
**orignalArray value address: 0x100406910**
**copyArray value address: 0x100406910**
**orignalArray pointer address: 0x7fff5fbff788**
**copyArray pointer address: 0x7fff5fbff780**

---

通过上面结果我们可以看到，value 的地址都是一样的，而 pointer 的地址是不一样的，这就说明了赋值操作是浅复制，只是生成两份对象的引用，而对象本身还是同一份。原对象值和副本对象的值操作是相互影响的。

---

**那么 OC 中如何实现深复制呢？ **

OC 中深复制是通过 copy 与 mutableCopy 方法实现（但不是都能达到深复制的目的），通过 copy 复制后的副本都是不可变的，通过 mutableCopy 复制后的副本都是可变的。如初始对象为 NSString 与 NSMutableString，通过 copy 后副本都是 NSString，而通过 mutableCopy 后都是 NSMutableString。
接下来分两种情况讨论 copy 与 mutableCopy：

**初始对象不可变（如 NSString、NSArray 等）**

调用 copy 方法也是**浅复制**，等同于直接赋值，因为复制过后的副本和原来的对象都是不可变的，所以调用 copy 本质就是赋值操作，复制了引用，但是都指向同一内存地址。
调用 mutableCopy 是**深复制**，副本成为了可变对象，但是操作副本，对初始对象的值不会产生影响。

试例代码：

```
void constCopyTest()
{
    printf("-----ConstCopy Test-----\n\n");
    
    printf("-NSString Copy-\n");
    NSString *str1 = @"Hello";
    NSString *str2 = [str1 copy];
    printf("orignalStr : %s\n",[str1 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str2 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str1);
    printf("copyStr value address: %p\n",str2);
    printf("orignalStr pointer address: %p\n",&str1);
    printf("copyStr pointer address: %p\n",&str2);
    printf("\n");
    
    NSMutableString *str3 = [str1 mutableCopy];
    [str3 appendString:@" World!"];
    printf("orignalStr : %s\n",[str1 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str3 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str1);
    printf("copyStr value address: %p\n",str3);
    printf("orignalStr pointer address: %p\n",&str1);
    printf("copyStr pointer address: %p\n",&str3);
    printf("\n");
    
    printf("-NSArray Copy-\n");
    NSArray *arr1 = [NSArray arrayWithObjects:[NSMutableString stringWithString:@"Hello"], nil];
    NSArray *arr2 = [arr1 copy];
    [[arr1 objectAtIndex:0] appendString:@" World!"];
    NSLog(@"orignalArray : %@",arr1);
    NSLog(@"copyArray : %@",arr2);
    printf("orignalArray value address: %p\n",arr1);
    printf("copyArray value address: %p\n",arr2);
    printf("orignalArray pointer address: %p\n",&arr1);
    printf("copyArray pointer address: %p\n",&arr2);
    printf("\n");
    
    NSMutableArray *arr3 = [arr1 mutableCopy];
    [arr3 addObject:@"World"];
    [[arr1 objectAtIndex:0] appendString:@" + str1"];
    [[arr3 objectAtIndex:0] appendString:@" + str3"];
    NSLog(@"orignalArray : %@",arr1);
    NSLog(@"copyArray : %@",arr3);
    printf("orignalArray value address: %p\n",arr1);
    printf("copyArray value address: %p\n",arr3);
    printf("orignalArray pointer address: %p\n",&arr1);
    printf("copyArray pointer address: %p\n",&arr3);
    printf("\n");
}
```

输出结果：

> **-----ConstCopy Test-----**

---

**-NSString Copy-**
**orignalStr : Hello**
**copyStr : Hello**
**orignalStr value address: 0x100002060**
**copyStr value address: 0x100002060**
**orignalStr pointer address: 0x7fff5fbff7a8**
**copyStr pointer address: 0x7fff5fbff7a0**

---

**orignalStr : Hello**
**copyStr : Hello World!**
**orignalStr value address: 0x100002060**
**copyStr value address: 0x1004074d0**
**orignalStr pointer address: 0x7fff5fbff7a8**
**copyStr pointer address: 0x7fff5fbff798**

---

**-NSArray Copy-**
**2016-08-22 11:35:20.314 CopyDemo[2046:72936] orignalArray : (**
**    "Hello World!"**
**)**
**2016-08-22 11:35:20.314 CopyDemo[2046:72936] copyArray : (**
**    "Hello World!"**
**)**
**orignalArray value address: 0x1001016b0**
**copyArray value address: 0x1001016b0**
**orignalArray pointer address: 0x7fff5fbff790**
**copyArray pointer address: 0x7fff5fbff788**

---

**2016-08-22 11:35:20.314 CopyDemo[2046:72936] orignalArray : (**
**    "Hello World! + str1 + str3"**
**)**
**2016-08-22 11:35:20.314 CopyDemo[2046:72936] copyArray : (**
**    "Hello World! + str1 + str3",**
**    World**
**)**
**orignalArray value address: 0x1001016b0**
**copyArray value address: 0x100300000**
**orignalArray pointer address: 0x7fff5fbff790**
**copyArray pointer address: 0x7fff5fbff780**

---

输出结果可以看到，通过 copy 方法复制后的副本对象的 value 地址和原对象是一样的，所以针对不可变对象是用 copy 方法是浅复制。而 mutableCopy 方法复制后，副本对象的 value 和 pointer 地址都和原对象不一样了，说明 mutableCopy 方法是深复制。

**初始对象可变（如 NSMutableString、NSMutableArray 等）**

调用 copy 方法是**深复制**，因为这里副本是不可变的，所以只考虑初始对象改变。因为是深复制，初始对象无论怎么改变，副本的值都是不变的。
调用 mutableCopy 也是**深复制**，复制过后，副本与初始对象之间的改变都是独立不影响的，如初始对象 str = “example”，str+” append1”，副本 str+” append2”，最终输出结果会是初始对象为”example append1”，副本为”example append2”。

试例代码：

```
void mutableCopyTest()
{
    printf("-----MutableCopy Test-----\n\n");
    
    printf("-NSString Copy-\n");
    NSMutableString *str1 = [NSMutableString stringWithString:@"Hello"];
    NSString *str2 = [str1 copy];
    [str1 appendString:@" World"];
    printf("orignalStr : %s\n",[str1 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str2 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str1);
    printf("copyStr value address: %p\n",str2);
    printf("orignalStr pointer address: %p\n",&str1);
    printf("copyStr pointer address: %p\n",&str2);
    printf("\n");
    
    NSMutableString *str3 = [str1 mutableCopy];
    [str1 appendString:@" + str1"];
    [str3 appendString:@" + str3"];
    printf("orignalStr : %s\n",[str1 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str3 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str1);
    printf("copyStr value address: %p\n",str3);
    printf("orignalStr pointer address: %p\n",&str1);
    printf("copyStr pointer address: %p\n",&str3);
    printf("\n");
    
    printf("-NSArray Copy-\n");
    NSMutableArray *arr1 = [NSMutableArray arrayWithObjects:[NSMutableString stringWithString:@"Hello"], nil];
    NSArray *arr2 = [arr1 copy];
    [[arr1 objectAtIndex:0] appendString:@" World!"];
    [arr1 addObject:@"Word"];
    NSLog(@"orignalArray : %@",arr1);
    NSLog(@"copyArray : %@",arr2);
    printf("orignalArray value address: %p\n",arr1);
    printf("copyArray value address: %p\n",arr2);
    printf("orignalArray pointer address: %p\n",&arr1);
    printf("copyArray pointer address: %p\n",&arr2);
    printf("\n");
    
    NSMutableArray *arr3 = [arr1 mutableCopy];
    [arr1 addObject:@"+arr1"];
    [arr3 addObject:@"+arr3"];
    [[arr1 objectAtIndex:0] appendString:@" + str1"];
    [[arr3 objectAtIndex:0] appendString:@" + str3"];
    NSLog(@"orignalArray : %@",arr1);
    NSLog(@"copyArray : %@",arr3);
    printf("orignalArray value address: %p\n",arr1);
    printf("copyArray value address: %p\n",arr3);
    printf("orignalArray pointer address: %p\n",&arr1);
    printf("copyArray pointer address: %p\n",&arr3);
    printf("\n");
}
```

输出结果：

> **-----MutableCopy Test-----**

---

**-NSString Copy-**
**orignalStr : Hello World**
**copyStr : Hello**
**orignalStr value address: 0x100300080**
**copyStr value address: 0x6f6c6c654855**
**orignalStr pointer address: 0x7fff5fbff7a8**
**copyStr pointer address: 0x7fff5fbff7a0**

---

**orignalStr : Hello World + str1**
**copyStr : Hello World + str3**
**orignalStr value address: 0x100300080**
**copyStr value address: 0x100300320**
**orignalStr pointer address: 0x7fff5fbff7a8**
**copyStr pointer address: 0x7fff5fbff798**

---

**-NSArray Copy-**
**2016-08-22 11:35:20.314 CopyDemo[2046:72936] orignalArray : (**
**    "Hello World!",**
**    Word**
**)**
**2016-08-22 11:35:20.314 CopyDemo[2046:72936] copyArray : (**
**    "Hello World!"**
**)**
**orignalArray value address: 0x100300000**
**copyArray value address: 0x100300b00**
**orignalArray pointer address: 0x7fff5fbff790**
**copyArray pointer address: 0x7fff5fbff788**

---

**2016-08-22 11:35:20.314 CopyDemo[2046:72936] orignalArray : (**
**    "Hello World! + str1 + str3",**
**    Word,**
**    "+arr1"**
**)**
**2016-08-22 11:35:20.314 CopyDemo[2046:72936] copyArray : (**
**    "Hello World! + str1 + str3",**
**    Word,**
**    "+arr3"**
**)**
**orignalArray value address: 0x100300000**
**copyArray value address: 0x100300e40**
**orignalArray pointer address: 0x7fff5fbff790**
**copyArray pointer address: 0x7fff5fbff780**

---

通过输出结果可以看到，对于可变对象，调用 copy 与 mutableCopy 方法都是深复制，因为副本的 value 和 pointer 地址都与原对象不同。

`注：对于网上某些解释说NSArray/NSMutableArray NSDictionary/NSMutableDictionary只有浅复制，这里认为对于对象本身来说调用mutableCopy或对于可变对象调用copy都是深复制，只能说对于数组和字典这种复合结构深复制操作只是作用到外层对象，内部如果还有可变对象，仅仅就是引用的复制。（上面的例子中对于数组的第一个元素的操作可以很清楚的看出来。即使是对数组的深复制，然而改变第一个可变字符串，无论是副本数组还是原数组的第一个字符串都改变了。）`

完整代码：

```
//
//  main.m
//  CopyDemo
//
//  Created by Jiao Liu on 6/23/16.
//  Copyright © 2016 ChangHong. All rights reserved.
//

#import <Foundation/Foundation.h>

void mutableCopyTest()
{
    printf("-----MutableCopy Test-----\n\n");
    
    printf("-NSString Copy-\n");
    NSMutableString *str1 = [NSMutableString stringWithString:@"Hello"];
    NSString *str2 = [str1 copy];
    [str1 appendString:@" World"];
    printf("orignalStr : %s\n",[str1 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str2 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str1);
    printf("copyStr value address: %p\n",str2);
    printf("orignalStr pointer address: %p\n",&str1);
    printf("copyStr pointer address: %p\n",&str2);
    printf("\n");
    
    NSMutableString *str3 = [str1 mutableCopy];
    [str1 appendString:@" + str1"];
    [str3 appendString:@" + str3"];
    printf("orignalStr : %s\n",[str1 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str3 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str1);
    printf("copyStr value address: %p\n",str3);
    printf("orignalStr pointer address: %p\n",&str1);
    printf("copyStr pointer address: %p\n",&str3);
    printf("\n");
    
    printf("-NSArray Copy-\n");
    NSMutableArray *arr1 = [NSMutableArray arrayWithObjects:[NSMutableString stringWithString:@"Hello"], nil];
    NSArray *arr2 = [arr1 copy];
    [[arr1 objectAtIndex:0] appendString:@" World!"];
    [arr1 addObject:@"Word"];
    NSLog(@"orignalArray : %@",arr1);
    NSLog(@"copyArray : %@",arr2);
    printf("orignalArray value address: %p\n",arr1);
    printf("copyArray value address: %p\n",arr2);
    printf("orignalArray pointer address: %p\n",&arr1);
    printf("copyArray pointer address: %p\n",&arr2);
    printf("\n");
    
    NSMutableArray *arr3 = [arr1 mutableCopy];
    [arr1 addObject:@"+arr1"];
    [arr3 addObject:@"+arr3"];
    [[arr1 objectAtIndex:0] appendString:@" + str1"];
    [[arr3 objectAtIndex:0] appendString:@" + str3"];
    NSLog(@"orignalArray : %@",arr1);
    NSLog(@"copyArray : %@",arr3);
    printf("orignalArray value address: %p\n",arr1);
    printf("copyArray value address: %p\n",arr3);
    printf("orignalArray pointer address: %p\n",&arr1);
    printf("copyArray pointer address: %p\n",&arr3);
    printf("\n");
}

void constCopyTest()
{
    printf("-----ConstCopy Test-----\n\n");
    
    printf("-NSString Copy-\n");
    NSString *str1 = @"Hello";
    NSString *str2 = [str1 copy];
    printf("orignalStr : %s\n",[str1 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str2 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str1);
    printf("copyStr value address: %p\n",str2);
    printf("orignalStr pointer address: %p\n",&str1);
    printf("copyStr pointer address: %p\n",&str2);
    printf("\n");
    
    NSMutableString *str3 = [str1 mutableCopy];
    [str3 appendString:@" World!"];
    printf("orignalStr : %s\n",[str1 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str3 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str1);
    printf("copyStr value address: %p\n",str3);
    printf("orignalStr pointer address: %p\n",&str1);
    printf("copyStr pointer address: %p\n",&str3);
    printf("\n");
    
    printf("-NSArray Copy-\n");
    NSArray *arr1 = [NSArray arrayWithObjects:[NSMutableString stringWithString:@"Hello"], nil];
    NSArray *arr2 = [arr1 copy];
    [[arr1 objectAtIndex:0] appendString:@" World!"];
    NSLog(@"orignalArray : %@",arr1);
    NSLog(@"copyArray : %@",arr2);
    printf("orignalArray value address: %p\n",arr1);
    printf("copyArray value address: %p\n",arr2);
    printf("orignalArray pointer address: %p\n",&arr1);
    printf("copyArray pointer address: %p\n",&arr2);
    printf("\n");
    
    NSMutableArray *arr3 = [arr1 mutableCopy];
    [arr3 addObject:@"World"];
    [[arr1 objectAtIndex:0] appendString:@" + str1"];
    [[arr3 objectAtIndex:0] appendString:@" + str3"];
    NSLog(@"orignalArray : %@",arr1);
    NSLog(@"copyArray : %@",arr3);
    printf("orignalArray value address: %p\n",arr1);
    printf("copyArray value address: %p\n",arr3);
    printf("orignalArray pointer address: %p\n",&arr1);
    printf("copyArray pointer address: %p\n",&arr3);
    printf("\n");
}

void assignTest()
{
    printf("-----Assign Test-----\n\n");
    
    NSString *str1 = @"Hello";
    NSString *str2 = str1;
    printf("orignalStr : %s\n",[str1 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str2 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str1);
    printf("copyStr value address: %p\n",str2);
    printf("orignalStr pointer address: %p\n",&str1);
    printf("copyStr pointer address: %p\n",&str2);
    printf("\n");
    
    NSMutableString *str3 = [NSMutableString stringWithString:@"Hello"];
    NSMutableString *str4 = str3;
    [str3 appendString:@" World"];
    [str4 appendString:@"!"];
    printf("orignalStr : %s\n",[str3 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("copyStr : %s\n",[str4 cStringUsingEncoding:NSUTF8StringEncoding]);
    printf("orignalStr value address: %p\n",str3);
    printf("copyStr value address: %p\n",str4);
    printf("orignalStr pointer address: %p\n",&str3);
    printf("copyStr pointer address: %p\n",&str4);
    printf("\n");
    
    NSMutableArray *arr1 = [NSMutableArray arrayWithObjects:@"Hello", nil];
    NSMutableArray *arr2 = arr1;
    [arr1 addObject:@"World"];
    [arr2 addObject:@"!"];
    NSLog(@"orignalArray : %@",arr1);
    NSLog(@"copyArray : %@",arr2);
    printf("orignalArray value address: %p\n",arr1);
    printf("copyArray value address: %p\n",arr2);
    printf("orignalArray pointer address: %p\n",&arr1);
    printf("copyArray pointer address: %p\n",&arr2);
    printf("\n");
}

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        // insert code here...
        assignTest();
        constCopyTest();
        mutableCopyTest();
    }
    return 0;
}
```

---

本文最早发布于长虹软服公众号，有兴趣的朋友可以去看一下：
[剖析【OC】中深复制与浅复制](http://mp.weixin.qq.com/s?__biz=MzAwMjkxNjYzNA==&mid=2247483852&idx=1&sn=9da01b2399427654ad12e36452f612c9&scene=23&srcid=0822iBXKqaGYwMOnRhVLxNVt#rd)
