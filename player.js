!function($) {
    function getAverageRGB(imgEl) {
        var blockSize = 5,
            defaultRGB = {r:255,g:255,b:255},
            canvas = document.createElement('canvas'),
            context = canvas.getContext && canvas.getContext('2d'),
            data, width, height,
            i = -4,
            length,
            rgb = {r:0,g:0,b:0},
            count = 0;
        if (!context) {
            return defaultRGB;
        }
        height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
        width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
        context.drawImage(imgEl, 0, 0);
        try {
            data = context.getImageData(0, 0, width, height);
        } catch(e) {
            return defaultRGB;
        }
        length = data.data.length;
        while ( (i += blockSize * 4) < length ) {
            ++count;
            rgb.r += data.data[i];
            rgb.g += data.data[i+1];
            rgb.b += data.data[i+2];
        }
        rgb.r = ~~(rgb.r/count);
        rgb.g = ~~(rgb.g/count);
        rgb.b = ~~(rgb.b/count);
        return rgb;
    }
    function getAllUrlParams(url) {
        var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
        var obj = {};
        if (queryString) {
            queryString = queryString.split('#')[0];
            var arr = queryString.split('&');
            for (var i = 0; i < arr.length; i++) {
                var a = arr[i].split('=');
                var paramName = a[0];
                var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
                paramName = paramName.toLowerCase();
                if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
                if (paramName.match(/\[(\d+)?\]$/)) {
                    var key = paramName.replace(/\[(\d+)?\]/, '');
                    if (!obj[key]) obj[key] = [];
                    if (paramName.match(/\[\d+\]$/)) {
                        var index = /\[(\d+)\]/.exec(paramName)[1];
                        obj[key][index] = paramValue;
                    } else {
                        obj[key].push(paramValue);
                    }
                } else {
                    if (!obj[paramName]) {
                        obj[paramName] = paramValue;
                    } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                        obj[paramName] = [obj[paramName]];
                        obj[paramName].push(paramValue);
                    } else {
                        obj[paramName].push(paramValue);
                    }
                }
            }
        }
        return obj;
    }
    let playlist = "2717890285",songs = [],currentPlaying = null,lrc = null,lrcStartPos = 0,transLrc = null,transLrcStartPos = 0,overlayAval = false,cPos = {x:0,y:0},errorCount = 0,lastMainLrc = "",lastSubLrc = "",cUrlReq = null;
    function randNfloor(min,max) {
        return Math.random()*(max-min+1)+min;
    }
    function rand(min,max) {
        return Math.floor(randNfloor(min,max));
    }
    function print(text) {
        console.log("%cPenguin%c" + text,"border-top-left-radius:5px;border-bottom-left-radius:5px;padding:0 5px;font-size:24px;font-family:'Microsoft YaHei Light','Microsoft YaHei';background-color:darkred;color:white;","border-top-right-radius:5px;border-bottom-right-radius:5px;padding:5px;padding-top:10px;padding-bottom:2px;font-size:14px;font-family:'Microsoft YaHei Light','Microsoft YaHei';background-color:pink;color:darkred;margin:5px;margin-left:0;");
    }
    function play(id) {
        if (id < 0 || id >= songs.length) {return;}
        if (cUrlReq != null && cUrlReq.readyState != 4 && songs[id].id == cUrlReq.song) {return;}
        let first = currentPlaying == null;
        currentPlaying = songs[id];
        currentPlaying.index = id;
        print("Start to play " + currentPlaying.name);
        player.find("audio")[0].src = "";
        player.find("audio").removeAttr("src");
        player.find("div.thumbnail > img")[0].src = currentPlaying.thumbnail.replace("http:","https:") + "?param=48y48";
        player.css("background-color","rgba(74,74,74,0.5)");
        player.css("color","white");
        let cid = currentPlaying.id;
        if (cUrlReq != null && cUrlReq.readyState != 4) {
            cUrlReq.abort();
        }
        cUrlReq = $.ajax({
            url: "https://gcm.tenmahw.com/song/url?id=" + cid,
            success: function(data) {
                if (cid != currentPlaying.id || player.find("audio").attr("src") != undefined) {
                    return;
                }
                if (data["code"] != 200) {
                    player.find("audio").trigger("error");
                    return;
                }
                try {
                    player.find("audio")[0].src = data["data"][0]["url"].replace("http:","https:");
                    if (!first||(new Date()).valueOf() - parseInt(localStorage.getItem("player_live")) >= 1000) {
                        if (!(first&&localStorage.getItem("player_user_pause") == "true")) {
                            player.find("audio")[0].play().then(function(val) {},function(err) {});
                        }
                    }
                } catch {
                    player.find("audio").trigger("error");
                }
            },
            error: function() {
                player.find("audio").trigger("error");
            },
            dataType: "json"
        });
        cUrlReq.song = cid;
        let songInfo = player.find("div.song-info");
        songInfo.children("h3").text(currentPlaying.name);
        songInfo.children("span").text(currentPlaying.artists);
        getLyric(currentPlaying.id);
        player.find("div.thumbnail").css("animation","none");
        setTimeout(function() {
            player.find("div.thumbnail").css("animation","");
        });
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentPlaying.name,
                artist: currentPlaying.artists,
                album: currentPlaying.album,
                artwork: [{src: currentPlaying.thumbnail.replace("http:","https:") + "?param=200y200", sizes: "200x200", type: "image/jpeg"}]
            });
        }
    }
    function next() {
        if (currentPlaying == null) {play(0);return;}
        if (currentPlaying.index == songs.length-1) {
            play(0);
        } else {
            play(currentPlaying.index+1);
        }
    }
    function prev() {
        if (currentPlaying == null) {play(songs.length-1);return;}
        if (currentPlaying.index == 0) {
            play(songs.length-1);
        } else {
            play(currentPlaying.index-1);
        }
    }
    function updateVolumeBar() {
        let volume = player.find("audio")[0].volume;
        let width = (volume*100) + "%";
        player.find(".volume-bar-inner").css("width",width);
    }
    function handleVolumeBarChange(x) {
        let vol = (x-player.find(".volume-bar").offset().left) / player.find(".volume-bar").width();
        if (vol > 1) {vol = 1;}
        if (vol < 0) {vol = 0;}
        localStorage.setItem("player_volume",vol);
        player.find("audio")[0].volume = vol;
        updateVolumeBar();
    }
    if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", function() {
            player.find("audio")[0].play().then(function(val) {},function(err) {});
        });
        navigator.mediaSession.setActionHandler("pause", function() {
            player.find("audio")[0].pause();
        });
        navigator.mediaSession.setActionHandler("previoustrack", prev);
        navigator.mediaSession.setActionHandler("nexttrack", next);
    }
    function getLyric(id) {
        lrcStartPos = 0;
        transLrcStartPos = 0;
        player.lyric.find("h3").text("");
        player.lyric.find("span").text("");
        lrc = null;
        transLrc = null;
        print("Try to fetch lyric for " + currentPlaying.name);
        $.ajax({
            url:"https://gcm.tenmahw.com/resolve/lyric?id=" + id,
            success:function(data) {
                if (currentPlaying.id != id) {return;}
                if (data.code != 200) {print("Can't fetch lyric for " + currentPlaying.name);return;}
                if (data.lyric == null) {print("No lyric for " + currentPlaying.name);return;}
                lrc = data.lyric.lrc;
                if (data.lyric.tlrc) {
                    print(currentPlaying.name + " has a translated lyric");
                    transLrc = data.lyric.tlrc;
                }
            },
            dataType:"json"
        });
    }
    function lyricFrame() {
        let aud = player.find("audio")[0];
        if (player.progress.dragging) {
            try {
            aud.currentTime = cPos.x / window.innerWidth * aud.duration;
            } catch {}
        }
        let mainLrc = "",subLrc = "";
        if (lrc != null&&!player.find("audio")[0].paused) {
            for (let i = lrcStartPos;i<lrc.length;i++) {
                let line = lrc[i];
                if (i == lrc.length-1||lrc[i+1].time > aud.currentTime*1000) {
                    if (lrc[i].time < aud.currentTime*1000) {
                        mainLrc = line.value;
                        if (transLrc == null&&i != lrc.length-1) {
                            subLrc = lrc[i+1].Value;
                        }
                    } else {
                        lrcStartPos = 0;
                        break;
                    }
                    lrcStartPos = i;
                    break;
                }
            }
            if (transLrc != null&&mainLrc != "") {
                for (let i = transLrcStartPos;i<transLrc.length;i++) {
                    let line = transLrc[i];
                    if (i == transLrc.length-1||transLrc[i+1].time > aud.currentTime*1000) {
                        if (transLrc[i].time < aud.currentTime*1000) {
                            subLrc = line.value;
                        } else {
                            transLrcStartPos = 0;
                            break;
                        }
                        transLrcStartPos = i;
                        break;
                    }
                }
            }
        }
        if (mainLrc != lastMainLrc) {
            player.lyric.find("h3").css("opacity","0");
            setTimeout(function() {
                if (mainLrc == "") {
                    player.lyric.find("h3").html("&nbsp;");
                } else {
                    player.lyric.find("h3").text(mainLrc);
                }
                player.lyric.find("h3").css("opacity","1");
            },100);
            lastMainLrc = mainLrc;
        }
        if (subLrc != lastSubLrc) {
            player.lyric.find("span").css("opacity","0");
            setTimeout(function() {
                if (subLrc == "") {
                    player.lyric.find("span").html("&nbsp;");
                } else {
                    player.lyric.find("span").text(subLrc);
                }
                player.lyric.find("span").css("opacity","1");
            },100);
            lastSubLrc = subLrc;
        }
        requestAnimationFrame(lyricFrame);
    }
    window.player = $("<div class='player hide'><div class='thumbnail'><img crossOrigin='anonymous'/></div><div class='control-overlay'><table cellspacing='0'><tr><td title='上一首'><i class='fa fa-backward'></i></td><td title='播放/暂停'><i class='fa fa-play play-pause'></i></td><td title='下一首'><i class='fa fa-forward'></i></td><td title='播放列表/音量调节'><i class='fa fa-navicon'></i></td></tr></table></div><div class='song-info'><h3></h3><span></span></div><div class='volume-control'><i class='fa fa-volume-up'></i><div class='volume-bar'><div class='volume-bar-inner'><div class='volume-bar-dot'></div></div></div></div><div class='song-list'></div><audio></audio></div>");
    player.lyric = $("<div class='lyric'><h3></h3><span></span></div>");
    player.progress = $("<div class='progressbar'><div class='inner'></div></div>");
    player.mouseenter(function() {
        player.removeClass("hide");
        setTimeout(function() {
            overlayAval = true;
        },50);
    });
    player.mouseleave(function() {
        player.addClass("hide");
        overlayAval = false;
    });
    player.find("div.thumbnail > img").on("load",function() {
        let color = getAverageRGB(player.find("div.thumbnail > img")[0]);
        player.css("background-color","rgba(" + color.r + "," + color.g + "," + color.b + ",0.5)");
        let brightness = (color.r+color.g+color.b)/3;
        if (brightness < 127) {
            player.css("color","white");
            player.find(".volume-bar").css("background-color","rgba(255,255,255,0.3)");
            player.find(".volume-bar-inner").css("background-color","rgba(255,255,255,0.5)");
            player.find(".volume-bar-dot").css({
                "background-color":"rgba(255,255,255,0.8)",
                "box-shadow":"0 0 5px white"
            });
        } else {
            player.css("color","rgb(30,30,30)");
            player.find(".volume-bar").css("background-color","rgba(30,30,30,0.3)");
            player.find(".volume-bar-inner").css("background-color","rgba(30,30,30,0.5)");
            player.find(".volume-bar-dot").css({
                "background-color":"rgba(30,30,30,0.8)",
                "box-shadow":"0 0 5px #333"
            });
        }
        print("Using R(" + color.r + ")G(" + color.g + ")B(" + color.b + ") color");
    });
    player.progress.mousedown(function() {
        player.progress.dragging = true;
        player.removeClass("playing");
    });
    player.progress.on("touchstart",function() {
        player.progress.dragging = true;
        player.removeClass("playing");
    });
    $(window).mouseup(function() {
        if (player.progress.dragging) {
            player.progress.dragging = false;
            player.addClass("playing");
        }
        if (player.volumeDragging) {
            player.volumeDragging = false;
        }
    });
    $(window).on("touchend",function() {
        if (player.progress.dragging) {
            player.progress.dragging = false;
            player.addClass("playing");
        }
        if (player.volumeDragging) {
            player.volumeDragging = false;
        }
    });
    $(window).mousemove(function(e) {
        cPos.x = e.pageX;
        cPos.y = e.pageY;
        if (player.volumeDragging) {
            handleVolumeBarChange(cPos.x);
        }
    });
    $(window).on("touchmove",function(e) {
        cPos.x = e.originalEvent.touches[0].pageX;
        cPos.y = e.originalEvent.touches[0].pageY;
        if (player.volumeDragging) {
            handleVolumeBarChange(cPos.x);
        }
    });
    $(window).on("close",function() {
        localStorage.removeItem("player_live");
    });
    $(window).on("scroll",function() {
    	if (document.body.scrollHeight - Math.max( $("html").scrollTop(), $("body").scrollTop() ) - window.innerHeight <= 5) {
        	player.lyric.css("opacity",0);
        } else {
            player.lyric.css("opacity","");
        }
    });
    player.find("audio").on("timeupdate",function() {
        let aud = player.find("audio")[0];
        player.progress.find(".inner").css("width",aud.currentTime / aud.duration * 100 + "%");
        localStorage.setItem("player_live",(new Date()).valueOf().toString());
    });
    player.find("audio").on("play",function() {
        localStorage.removeItem("player_user_pause");
        player.addClass("playing");
        player.find(".play-pause").removeClass("fa-play");
        player.find(".play-pause").addClass("fa-pause");
        navigator.mediaSession.playbackState = "playing";
    });
    player.find("audio").on("pause",function() {
        player.removeClass("playing");
        player.find(".play-pause").removeClass("fa-pause");
        player.find(".play-pause").addClass("fa-play");
        navigator.mediaSession.playbackState = "paused";
    });
    player.find("audio").on("ended",function() {
        player.removeClass("playing");
        player.find(".play-pause").removeClass("fa-pause");
        player.find(".play-pause").addClass("fa-play");
        navigator.mediaSession.playbackState = "none";
        next();
    });
    player.find("audio").on("load",function() {
        errorCount = 0;
    });
    player.find("audio").on("error",function() {
        errorCount++;
        if (errorCount >= 5) {
            print("Too many errors, stop playing");
            errorCount = 0;
            return;
        }
        player.removeClass("playing");
        player.find(".play-pause").removeClass("fa-pause");
        player.find(".play-pause").addClass("fa-play");
        next();
    });
    player.find(".fa-backward").parent().click(function() {
        if (!overlayAval) {return;}
        prev();
    });
    player.find(".play-pause").parent().click(function() {
        if (!overlayAval) {return;}
        let aud = player.find("audio")[0];
        if (aud.paused) {
            aud.play().then(function() {},function() {});
        } else {
            localStorage.setItem("player_user_pause","true");
            aud.pause();
        }
    });
    player.find(".fa-forward").parent().click(function() {
        if (!overlayAval) {return;}
        next();
    });
    player.find(".fa-navicon").parent().click(function() {
        if (!overlayAval) {return;}
        if (player.find(".song-list").hasClass("show")) {
            player.find(".song-list").removeClass("show");
            player.lyric.removeClass("listed");
            setTimeout(function() {
                player.removeClass("listed");
            },300);
        } else {
            if (songs.length != player.find(".song-list").children().length) {
                player.find(".song-list").find("*").remove();
                for (let i = 0;i<songs.length;i++) {
                    let song = songs[i];
                    player.find(".song-list").append("<div class='song' data-index='" + i + "'><img src='" + song.thumbnail.replace("http:","https:") + "?param=48y48'/><h5>" + song.name + "</h5><span>" + song.artists + "</span></div>");
                }
                player.find(".song").click(function() {
                    play($(this).data("index"));
                });
            }
            player.addClass("listed");
            player.lyric.addClass("listed");
            player.find(".song-list").addClass("show");
        }
    });
    player.find(".volume-bar").mousedown(function() {
        handleVolumeBarChange(cPos.x);
        player.volumeDragging = true;
        return false;
    });
    player.find(".volume-control").on("touchstart",function(e) {
        e.preventDefault();
        handleVolumeBarChange(e.originalEvent.touches[0].pageX);
        player.volumeDragging = true;
    });
    print("Fetching playlist...");
    $.ajax({
        url:"https://gcm.tenmahw.com/resolve/playlist?id=" + playlist,
        success:function(data) {
            if (data.code != 200) {
                print("Can't fetch playlist from Netease");
                return;
            }
            print("Using playlist " + data.playlist.name);
            for (let i = 0;i<data.playlist.tracks.length;i++) {
                let track = data.playlist.tracks[i];
                if (location.protocol == "https:") {
                    track.al.picUrl = track.al.picUrl.replace("http:",location.protocol);
                }
                let artists = "";
                for (let artist of track.ar) {
                    artists += artist.name + ", ";
                }
                artists = artists.substring(0,artists.length-2);
                let song = {
                    id:track.id,
                    name:track.name,
                    artists:artists,
                    album:track.al.name,
                    thumbnail:track.al.picUrl
                };
                songs.push(song);
            }
            if (getAllUrlParams().song != undefined&&!isNaN(parseInt(getAllUrlParams().song))) {
                play(parseInt(getAllUrlParams().song));
            } else {
                play(rand(0,songs.length-1));
            }
            player.find("audio")[0].volume = localStorage.getItem("player_volume") || 1;
            $("body").append(player);
            $("body").append(player.lyric);
            $("body").append(player.progress);
            updateVolumeBar();
            requestAnimationFrame(lyricFrame);
            print("Player ready!");
        },
        dataType:"json"
    });
}(jQuery);
