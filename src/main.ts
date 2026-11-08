import { BOARDSIZE, initPiecesSvg } from './conifg';
import { initBoard } from './board';
import { Board } from './game/board';
import { PiecesScreenHandling } from './pieces';

function setUpDiv() {
    const gameDiv = document.getElementById('gameDiv') as HTMLDivElement;
    gameDiv.style = `width: ${BOARDSIZE}px; height: ${BOARDSIZE}px;`;
}

async function main() {
    setUpDiv();
    await initPiecesSvg();
    initBoard();

    const board = new Board(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
    const piecesHandler = new PiecesScreenHandling(board);
    console.log(piecesHandler);
}

main();
