if (jQuery) {$=jQuery;}
!function() {
    let playlist = "2717890285",songs = [],currentPlaying = null,lrc = null,lrcStartPos = 0,transLrc = null,transLrcStartPos = 0,overlayAval = false,cPos = {x:0,y:0},errorCount = 0;
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
        currentPlaying = songs[id];
        currentPlaying.index = id;
        print("Start to play " + currentPlaying.name);
        player.find("img.thumbnail")[0].src = currentPlaying.thumbnail;
        player.css("background-color","rgba(74,74,74,0.5)");
        player.css("color","white");
        RGBaster.colors(player.find("img.thumbnail")[0],{
            exclude:['rgb(255,255,255)','rgb(0,0,0)'],
            success:function(res) {
                let color = res.dominant.match(/rgb\(([0-9]+)?,([0-9]+)?,([0-9]+)?\)/);
                if (color == null) {print("Can't get RGB color for " + currentPlaying.name);return;}
                player.css("background-color","rgba(" + color[1] + "," + color[2] + "," + color[3] + ",0.5)");
                let brightness = (parseInt(color[1])+parseInt(color[2])+parseInt(color[3]))/3;
                if (brightness < 127) {
                    player.css("color","white");
                } else {
                    player.css("color","rgb(30,30,30)");
                }
                print("Using R(" + color[1] + ")G(" + color[2] + ")B(" + color[3] + ") color");
            }
        });
        player.find("audio")[0].src = currentPlaying.url;
        player.find("audio")[0].play().then(function(val) {},function(err) {});
        let songInfo = player.find("div.song-info");
        songInfo.children("h3").text(currentPlaying.name);
        songInfo.children("span").text(currentPlaying.artists);
        getLyric(currentPlaying.id);
        player.find("img.thumbnail").css("animation","none");
        setTimeout(function() {
            player.find("img.thumbnail").css("animation","");
        });
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
    function getLyric(id) {
        lrcStartPos = 0;
        transLrcStartPos = 0;
        player.lyric.find("h3").text("");
        player.lyric.find("span").text("");
        lrc = null;
        transLrc = null;
        print("Try to fetch lyric for " + currentPlaying.name);
        $.ajax({
            url:"https://texaservice.tk:21341/NeteaseLyric.aspx?song=" + id,
            success:function(data) {
                if (currentPlaying.id != id) {return;}
                if (data.code != 200) {print("Can't fetch lyric for " + currentPlaying.name);return;}
                if (data.lyric.length == 0) {print("No lyric for " + currentPlaying.name);return;}
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
                if (i == lrc.length-1||lrc[i+1].Time > aud.currentTime*1000) {
                    if (lrc[i].Time < aud.currentTime*1000) {
                        mainLrc = line.Value;
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
                    if (i == transLrc.length-1||transLrc[i+1].Time > aud.currentTime*1000) {
                        if (transLrc[i].Time < aud.currentTime*1000) {
                            subLrc = line.Value;
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
        player.lyric.find("h3").text(mainLrc);
        player.lyric.find("span").text(subLrc);
        requestAnimationFrame(lyricFrame);
    }
    window.player = $("<div class='player hide'><img class='thumbnail'/><div class='control-overlay'><table cellspacing='0'><tr><td><i class='fa fa-backward'></i></td><td><i class='fa fa-play play-pause'></i></td><td><i class='fa fa-forward'></i></td><td><i class='fa fa-navicon'></i></td></tr></table></div><div class='song-info'><h3></h3><span></span></div><div class='song-list'></div><audio id='player'></audio></div>");
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
    player.progress.mousedown(function() {
        player.progress.dragging = true;
    });
    $(window).mouseup(function() {
        player.progress.dragging = false;
    });
    $(window).mousemove(function(e) {
        cPos.x = e.pageX;
        cPos.y = e.pageY;
    });
    player.find("audio").on("timeupdate",function() {
        let aud = player.find("audio")[0];
        player.progress.find(".inner").css("width",aud.currentTime / aud.duration * 100 + "%");
    });
    player.find("audio").on("play",function() {
        player.addClass("playing");
        player.find(".play-pause").removeClass("fa-play");
        player.find(".play-pause").addClass("fa-pause");
    });
    player.find("audio").on("pause",function() {
        player.removeClass("playing");
        player.find(".play-pause").removeClass("fa-pause");
        player.find(".play-pause").addClass("fa-play");
    });
    player.find("audio").on("ended",function() {
        player.removeClass("playing");
        player.find(".play-pause").removeClass("fa-pause");
        player.find(".play-pause").addClass("fa-play");
        next();
    });
    player.find("audio").on("load",function() {
        errorCount = 0;
    });
    player.find("audio").on("error",function() {
        errorCount++;
        if (errorCount >= 5) {
            console.log("Too many errors, stop playing");
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
            player.addClass("listed");
            player.lyric.addClass("listed");
            player.find(".song-list").addClass("show");
        }
    });
    print("Fetching playlist...");
    $.ajax({
        url:"https://tenmahw.com/tPlayer/tplayer.php?id=" + playlist,
        success:function(data) {
            if (data.code != 200) {
                print("Can't fetch playlist from Netease");
                return;
            }
            print("Using playlist " + data.result.name);
            for (let i = 0;i<data.result.tracks.length;i++) {
                let track = data.result.tracks[i];
                if (location.protocol == "https:") {
                    track.album.picUrl = track.album.picUrl.replace("http:",location.protocol);
                }
                let artists = "";
                for (let artist of track.artists) {
                    artists += artist.name + ", ";
                }
                artists = artists.substring(0,artists.length-2);
                let song = {
                    id:track.id,
                    name:track.name,
                    artists:artists,
                    thumbnail:track.album.picUrl,
                    url:(location.protocol == "file:" ? location.protocol : "") + "//music.163.com/song/media/outer/url?id=" + track.id + ".mp3"
                };
                songs.push(song);
                player.find(".song-list").append("<div class='song' data-index='" + i + "'><img src='" + song.thumbnail + "'/><h5>" + song.name + "</h5><span>" + song.artists + "</span></div>");
            }
            player.find(".song").click(function() {
                play($(this).data("index"));
            });
            play(rand(0,songs.length-1));
            $("body").append(player);
            $("body").append(player.lyric);
            $("body").append(player.progress);
            requestAnimationFrame(lyricFrame);
            print("Player ready!");
        },
        dataType:"json"
    });
}();