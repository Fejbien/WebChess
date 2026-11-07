import { BOARDSIZE } from './conifg';
import { initBoard } from './board';
import { Board } from './game/class/board';

function setUpDiv() {
    const gameDiv = document.getElementById('gameDiv') as HTMLDivElement;
    gameDiv.style = `width: ${BOARDSIZE}px; height: ${BOARDSIZE}px;`;
}

function main() {
    setUpDiv();
    initBoard();
    // const board = new Board();
    // console.log(board.getWhitePawns());
}

main();
