import { BOARDSIZE } from "./conifg";
import { initBoard } from "./board";

function setUpDiv() {
    const gameDiv = document.getElementById("gameDiv") as HTMLDivElement;
    gameDiv.style = `width: ${BOARDSIZE}px; height: ${BOARDSIZE}px;`;
}

function main() {
    setUpDiv();
    initBoard();
}

main();
