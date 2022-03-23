// Concept code, might be changed in future

// First, make sure you know how to use Penguin Player's exports
// All functions or properties used below will be simplified to export name

// If you are using standalone JavaScript file, it will be exposed under
window.PPlayer
// And to access initialize function, just
PPlayer.initialize(/* options */);

// If you are using npm package, you can import it like
import PPlayer from "@m4tec/penguinplayer";
PPlayer.initialize(/* options */);
// or
import { initialize } from "@m4tec/penguinplayer";
initialize(/* options */);


// The simplest way to use it is give a list of playlist to player
initialize([ // Initialize with an array of playlist
    { // Playlist
        provider: "netease", // Playlist provider (which means music platform)
        id: "[NETEASE CLOUD MUSIC PLAYLIST ID]" // Platform's playlist metadata
    }
]);
// That's it! You are getting a fixed (float on page) player!