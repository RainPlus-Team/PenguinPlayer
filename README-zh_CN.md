# PenguinPlayer
![GitHub Workflow状态](https://img.shields.io/github/workflow/status/M4TEC/PenguinPlayer/Compile%20the%20player?label=%E7%BC%96%E8%AF%91%E7%8A%B6%E6%80%81)
[![可维护性](https://img.shields.io/codeclimate/maintainability/M4TEC/PenguinPlayer?label=%E5%8F%AF%E7%BB%B4%E6%8A%A4%E6%80%A7)](https://codeclimate.com/github/M4TEC/PenguinPlayer/maintainability)
![代码大小](https://img.shields.io/github/languages/code-size/M4TEC/PenguinPlayer?label=%E4%BB%A3%E7%A0%81%E5%A4%A7%E5%B0%8F)
[![许可证](https://img.shields.io/github/license/M4TEC/PenguinPlayer?label=%E8%AE%B8%E5%8F%AF%E8%AF%81)](https://github.com/M4TEC/PenguinPlayer/blob/master/LICENSE)
![下载次数](https://img.shields.io/github/downloads/M4TEC/PenguinPlayer/total?label=%E4%B8%8B%E8%BD%BD%E6%AC%A1%E6%95%B0)
![版本](https://img.shields.io/github/package-json/v/M4TEC/PenguinPlayer?label=%E7%89%88%E6%9C%AC)
[![GitHub issues](https://img.shields.io/github/issues/M4TEC/PenguinPlayer)](https://github.com/M4TEC/PenguinPlayer/issues)
[![GitHub stars](https://img.shields.io/github/stars/M4TEC/PenguinPlayer)](https://github.com/M4TEC/PenguinPlayer/stargazers)
[![FOSSA状态](https://app.fossa.com/api/projects/git%2Bgithub.com%2FM4TEC%2FPenguinPlayer.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FM4TEC%2FPenguinPlayer?ref=badge_shield)

一个基于网易云音乐的简易播放器，而且它仅仅是**一个**JavaScript文件！

## 亮点
- 移动/触控设备支持
- Internet Explorer 10+支持
- 简洁，好看还好用
- 使用简单

## 用法
首先，下载[最新版本](https://github.com/M4TEC/PenguinPlayer/releases/latest/download/player.js)的播放器。

现在，在```window```上下文中设置```penguinplayer_id```来使用你的歌单，比如```window.penguinplayer_id = "440401494"```。播放器会使用你所提供的歌单ID自动初始化。

你也可以在之后通过调用```window.PPlayer.initialize("[你的歌单ID]")```来进行初始化。

然后只需要将你刚刚下载的JavaScript文件引入到你的页面里！

### 高级用法
你可以用一个更复杂的方法来使用它。

通过```window.PPlayer.initialize(options: PenguinPlayerOptions)```来初始化。

下面的表格包含所有可用选项。
| 属性 | 描述 |
| ---- | ---- |
| playlist: ```string``` | 播放列表ID |
| startIndex?: ```number``` | 指定在初始化后要播放的音乐索引，留空随机 |
| overrideVolume?: ```number``` | 使用提供的音量而不使用默认或已保存的 |
| overridePlaymode?: ```Playmodes``` | 使用提供的播放模式而不使用默认或已保存的 |

## 版本
| 文件名 | 描述 |
| ----- | ---- |
| player.js | ```推荐``` 这个版本能在现代浏览器中使用 |
| player.no-style.js | 不包含样式的版本 |
| player.ie.js | 一个包含为```Internet Explorer```准备的兼容代码的版本，如果你使用IE请使用本版本 |
| player.no-style.ie.js | ```player.no-style.js```和```player.ie.js```的缝合怪 |

## 接口
播放器的所有接口都暴露在```window```上下文的```PPlayer```对象中
| 属性名 | 描述 |
| ----- | ---- |
| initialize(```id: string```) | 初始化播放器 |
| play(```index?: number```) | 播放。如果指定```index```的值则会播放歌单相应位置的歌曲 |
| pause() | 暂停 |
| next() | 下一首 |
| previous() | 上一首 |
| addEventListener(```name: string, handler: Function```) | 添加一个事件监听器 |
| removeEventListener(```name: string, handler: Function```) | 移除一个事件监听器 |
| volume: ```number``` | 音量。有效值在```0-1```之间 |
| currentTime: ```number``` | 当前时间位置 |
| duration: ```number``` | ```getter``` 歌曲时长 |
| paused: ```boolean``` | ```getter``` 是否暂停 |
| song: ```Song``` | 当前歌曲 |
| playlist: ```Song[]``` | 歌单 |

## 事件
所有在此表格内声明的事件除特殊声明外都需要通过```PPlayer.addEventListener()```来监听。
| 事件名称 | 描述 | 参数 |
| ---------- | ----------- | --------- |
| penguinplayerapiready | 在```window.PPlayer```上下文可用时被触发。 **此事件在```window.addEventListener```中监听** | *无参数* |
| setup | 在播放器开始准备时触发 | *无参数* |
| initialized | 在播放器初始化完毕时触发 | *无参数* |
| songchange | 在音乐改变时触发 | song: ```Song``` |
| themecolorchange | 在主题颜色改变时触发 | color: ```Color```, foregroundColor: ```Color```, whiteForgroundColor: ```Color```, palette: ```Color[]``` |

## 许可证
[![FOSSA状态](https://app.fossa.com/api/projects/git%2Bgithub.com%2FM4TEC%2FPenguinPlayer.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FM4TEC%2FPenguinPlayer?ref=badge_large)

## 提示
如果你正在查看预览页面，你可以通过在网址后面添加```?playlist=[你的歌单ID]```来使用你自己的歌单。

## 捐助
你可以在 http://afdian.net/@TenmaHiltonWhat 给我买~~一瓶可乐~~一杯咖啡 ;P
