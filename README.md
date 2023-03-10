# GenshinWishCalculator

## 功能介绍
>本插件可以根据玩家当前拥有纠缠之缘数目和角色池、武器池的水位、保底情况，计算出抽取指定数目五星up角色和特定的五星up武器的概率

>我同时还写了该插件的一个[需要python的版本](https://github.com/MSIsunny/GenshinWishCalculator-py)，它的运行速度更快，计算所需时间约是该版本的十分之一，但是安装过程较为麻烦

## 安装教程
1、使用本插件需要安装mathjs库，打开终端运行以下命令进行安装

```
npm install mathjs
```

>或者你可以参考[mathjs官网](https://mathjs.org/download.html)的说明进行安装

2、给云崽添加mathjs的依赖，在云崽根目录下运行以下命令

```
pnpm add mathjs -w
```
3、自行将WishCalculator.js文件放到example文件夹中，重启云崽即可使用

## 使用教程
>在群里发送  计算/概率/期望 任一关键词即可查看使用帮助，内有详细使用教程

<img width="350" src="https://github.com/MSIsunny/GenshinWishCalculator-plugin/blob/main/image/help.jpeg"> </img>

>按照顺序提供数据即可以计算达到抽卡预期的概率

<img width="350" src="https://github.com/MSIsunny/GenshinWishCalculator-plugin/blob/main/image/usage.jpeg"> </img>

>注意：因为本插件的计算量比较大，为避免被用户滥用，默认不支持私聊，仅支持群聊使用

## 实现原理
>使用转移概率矩阵计算祈愿概率，与迭代法模拟上万次抽卡不同，此方法得到的是精确结果，不存在随机涨落

>计算结果的正确性已经通过迭代法大量模拟抽卡得到初步验证，如果仍存在错误还望指出

>我在这里随附了一份python的实现，里面有部分注释，可以参考一下
