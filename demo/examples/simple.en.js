// Concept code, might be changed in future

// First, make sure you know how to use Penguin Player's exports
// All functions or properties used below will be simplified to export name

// If you are using standalone JavaScript file, it will be exposed under
window.PPlayer;
// And to access initialize function, just
PPlayer.initialize(/* options */);

// If you are using npm package, you can import it like
import PPlayer from "@m4tec/penguinplayer";
PPlayer.initialize(/* options */);
// or
import { initialize } from "@m4tec/penguinplayer";
initialize(/* options */);


// The simplest way to use it is give a playlist to player
initialize({ // Initialize with a playlist
    provider: "netease", // Playlist provider (which means music platform)
    id: "[NETEASE CLOUD MUSIC PLAYLIST ID]" // Platform's playlist metadata
});
// Or you can add multiple playlists
initialize([ // Initialize with an array of playlist
    { // Playlist
        provider: "netease", // Playlist provider (which means music platform)
        id: "[NETEASE CLOUD MUSIC PLAYLIST ID]" // Platform's playlist metadata
    },
    // More playlists...
]);
// That's it! You are getting a fixed (float on page) player!

// Or you want to embed it to somewhere...
initialize({ // Initialize with a playlist
    provider: "netease", // Playlist provider (which means music platform)
    id: "[NETEASE CLOUD MUSIC PLAYLIST ID]" // Platform's playlist metadata
}, document.querySelector("#player_container") // Set its parent
);