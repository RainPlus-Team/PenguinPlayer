// 概念代码，未来可能会有变化

// 首先，确保你会使用Penguin Player的导出功能
// 以下使用的所有函数/属性都会被简化为导出名称

// 如果你正使用独立的JavaScript文件，它会被暴露在
window.PPlayer;
// 如果要访问initialize（初始化）函数，只需要
PPlayer.initialize(/* 选项 */);

// 如果你正在使用npm包，你可以通过下方展示的代码导入它
import PPlayer from "@m4tec/penguinplayer";
PPlayer.initialize(/* 选项 */);
// 或者
import { initialize } from "@m4tec/penguinplayer";
initialize(/* 选项 */);


// 最简单的使用方法就是只给它一个播放列表
initialize({ // 使用一个播放列表初始化
    provider: "netease", // 播放列表提供方（也就是音乐平台）
    id: "[NETEASE CLOUD MUSIC PLAYLIST ID]" // 平台特定播放列表数据
});
// 你也可以添加多个播放列表
initialize([ // 使用播放列表数组初始化
    { // 播放列表
        provider: "netease", // 播放列表提供方（也就是音乐平台）
        id: "[NETEASE CLOUD MUSIC PLAYLIST ID]" // 平台特定播放列表数据
    },
    // 其它播放列表...
]);
// 完事！你得到了一个固定在页面上的播放器！

// 但或许你想要把它嵌入到什么地方...
initialize(
    [ // 使用播放列表数组初始化
        { // 播放列表
            provider: "netease", // 播放列表提供方（也就是音乐平台）
            id: "[网易云音乐播放列表ID]" // 平台特定播放列表数据
        }
    ], document.querySelector("#player_container") // 设置它的父元素
);