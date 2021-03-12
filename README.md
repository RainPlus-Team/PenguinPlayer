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

Now, set your playlist ID by setting ```penguin_id``` in ```window``` context, for example ```window.penguin_id = "440401494"```.

Then just include the JavaScript file that you just downloaded inside your page!

## Versions
| File Name | Description |
| --------- | ----------- |
| player.js | ```Recommend``` This version will work in modern browsers |
| player.ie.js | A version that contains polyfills for ```Internet Explorer```, use this if you want to support it |

### Note
If you are visiting the demo page, you can use your own playlist by append ```?playlist=[YOUR PLAYLIST ID HERE]``` after the URL

### Donate
You can buy me a ~~cola~~ coffee at http://afdian.net/@TenmaHiltonWhat ;P