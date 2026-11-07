import { BOARDSIZE, initPiecesSvg } from './conifg';
import { initBoard } from './board';
import { Board } from './game/classes/board';
import { initPieces } from './pieces';

function setUpDiv() {
    const gameDiv = document.getElementById('gameDiv') as HTMLDivElement;
    gameDiv.style = `width: ${BOARDSIZE}px; height: ${BOARDSIZE}px;`;
}

function main() {
    setUpDiv();
    initPiecesSvg();
    initBoard();
    const board = new Board();
    initPieces(board);
}

main();
