[中文README](README-zh_CN.md)

# PenguinPlayer
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/M4TEC/PenguinPlayer/Compile%20the%20player)
[![Maintainability](https://img.shields.io/codeclimate/maintainability/M4TEC/PenguinPlayer)](https://codeclimate.com/github/M4TEC/PenguinPlayer/maintainability)
![Code size in bytes](https://img.shields.io/github/languages/code-size/M4TEC/PenguinPlayer)
[![License](https://img.shields.io/github/license/M4TEC/PenguinPlayer)](https://github.com/M4TEC/PenguinPlayer/blob/master/LICENSE)
![Downloads](https://img.shields.io/github/downloads/M4TEC/PenguinPlayer/total)
![Version](https://img.shields.io/github/package-json/v/M4TEC/PenguinPlayer)
[![GitHub issues](https://img.shields.io/github/issues/M4TEC/PenguinPlayer)](https://github.com/M4TEC/PenguinPlayer/issues)
[![GitHub stars](https://img.shields.io/github/stars/M4TEC/PenguinPlayer)](https://github.com/M4TEC/PenguinPlayer/stargazers)

A simple player based on Netease Cloud Music, and it only needs to load ONE JavaScript file!

## Usage
First, download the [latest release](https://github.com/M4TEC/PenguinPlayer/releases/latest) of the player from Releases.

Now, set your playlist ID by setting ```penguinplayer_id``` in ```window``` context, for example ```window.penguinplayer_id = "440401494"```. The player will initialize for you with id you provided.

Or you can initialize it anytime later by calling ```window.PPlayer.initialize("[YOUR PLAYLIST ID HERE]")```.

Then just include the JavaScript file that you just downloaded inside your page!

## Versions
| File Name | Description |
| --------- | ----------- |
| player.js | ```Recommend``` This version will work in modern browsers |
| player.ie.js | A version that contains polyfills for ```Internet Explorer```, use this if you want to support it |

## API
Every API of the player is exposed in ```PPlayer``` object of ```window``` context.
| Property | Description |
| -------- | ----------- |
| initialize(```id: string```) | Initialize the player |
| play(```index?: number```) | Play. If ```index``` is specified, the player will play the song in the song in corresponding position in the playlist |
| pause() | Pause |
| next() | Next song |
| previous() | Previous song |
| addEventListener(```name: string, handler: Function```) | Add a event listener |
| removeEventListener(```name: string, handler: Function```) | Remove a event listener |
| volume: ```number``` | Volume. Valid values are between ```0-1``` |
| currentTime: ```number``` | Current time position |
| duration: ```number``` | ```getter``` Song duration |
| paused: ```boolean``` | ```getter``` Is paused |
| song: ```Song``` | Current song |
| playlist: ```Song[]``` | Current playlist |

## Events
All events declared in this table needed to be listened using ```PPlayer.addEventListener()``` unless there is a special note.
| Event name | Description | Parameter |
| ---------- | ----------- | --------- |
| penguinready | Triggered when ```window.PPlayer``` context is ready. **This is triggered in ```window.addEventListener```** | *No parameter* |
| setup | Triggered when the player starts setting up | *No parameter* |
| initialized | Trigger when the player is initialized | *No parameter* |
| songchange | Triggered when the song has changed | song: ```Song``` |
| themecolorchange | Trigger when the theme color has changed | color: ```Color```, palette: ```Color[]``` |

### Note
If you are visiting the demo page, you can use your own playlist by append ```?playlist=[YOUR PLAYLIST ID HERE]``` after the URL

### Donate
You can buy me a ~~cola~~ coffee at http://afdian.net/@TenmaHiltonWhat ;P