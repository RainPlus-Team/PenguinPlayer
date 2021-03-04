[中文README](README-zh_CN.md)

# PenguinPlayer
[![Maintainability](https://api.codeclimate.com/v1/badges/d9903fe9ee1f24a780be/maintainability)](https://codeclimate.com/github/M4TEC/PenguinPlayer/maintainability)

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