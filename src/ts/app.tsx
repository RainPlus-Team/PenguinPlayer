import { h, render } from "preact";

import Layout from "Theme/layout";

const player = document.createElement("div");
player.classList.add("PenguinPlayer");

document.body.append(player);

render(<Layout />, player);