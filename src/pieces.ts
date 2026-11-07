import * as cf from './conifg';
import type { Board } from './game/classes/board';

interface Coordinates {
    rankIndex: number;
    fileIndex: number;
}

function drawPieces(ctx: CanvasRenderingContext2D, board: Board) {
    const map = new Map<() => bigint, HTMLImageElement>([
        [board.getWhitePawns, cf.WHITEPAWNIMAGE],
        [board.getWhiteBishops, cf.WHITEBISHOPIMAGE],
    ]);

    const squareSize = cf.SQURESIZE;

    for (const [func, image] of map) {
        const coordinates = getPieceCoordinates(func());
        for (const coordinate of coordinates) {
            ctx.drawImage(
                image,
                coordinate.fileIndex * squareSize,
                coordinate.rankIndex * squareSize,
                squareSize,
                squareSize
            );
        }
    }

    getPieceCoordinates(board.getWhiteBishops());
}

function getPieceCoordinates(bitboard: bigint): Coordinates[] {
    const coords: Coordinates[] = [];
    let board = bitboard;

    while (board > 0n) {
        const ls1b = board & -board; // LS1B
        const squareIndex = Math.log2(Number(ls1b));
        const fileIndex = squareIndex & 7;
        const rankIndex = squareIndex >> 3;

        coords.push({ rankIndex, fileIndex });
        board &= board - 1n;
    }

    return coords;
}

function initPieces(board: Board | null = null) {
    const cPiecesLayer = document.getElementById(
        'pieces-layer'
    ) as HTMLCanvasElement;
    const ctxPiecesLayer = cPiecesLayer.getContext('2d');
    cPiecesLayer.width = cf.BOARDSIZE;
    cPiecesLayer.height = cf.BOARDSIZE;

    if (ctxPiecesLayer === null) {
        console.error("ctxBoardLayer is null, can't conitnue");
        return;
    }

    if (board) drawPieces(ctxPiecesLayer, board);
}

export { initPieces };
