import * as cf from './conifg';

function drawBoard(ctx: CanvasRenderingContext2D) {
    const squareSize = cf.SQURESIZE;
    ctx.fillStyle = cf.LIGHTSUQRECOLOUR;
    // Board itself
    ctx.fillRect(0, 0, cf.BOARDSIZE, cf.BOARDSIZE);
    for (let i: number = 1; i <= 8; i++) {
        for (let j: number = 1; j <= 8; j++) {
            ctx.fillStyle =
                (i + j) % 2 ? cf.LIGHTSUQRECOLOUR : cf.DARKSQUARECOLOUR;
            ctx.fillRect(
                i * squareSize,
                j * squareSize,
                squareSize,
                squareSize
            );
        }
    }

    // everything else is dark of board ui
    ctx.fillStyle = cf.DARKSQUARECOLOUR;

    // horitontal a b c d e f g h
    ctx.font = cf.BOARDFONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const halfSquareSize = squareSize / 2;
    for (let i = 1; i <= 8; i++) {
        ctx.fillText(
            String.fromCharCode(96 + i), // charcode for a = 97, minues 1 so it nicely display
            i * squareSize + halfSquareSize,
            squareSize * 9 + halfSquareSize + 2, // just so it matches whats below
            squareSize
        );
    }
    // vertical 1 2 3 4 5 6 7 8
    for (let i = 1; i <= 8; i++) {
        ctx.fillText(
            Math.abs(i - 9).toString(),
            halfSquareSize,
            i * squareSize + halfSquareSize + 2, // + 2 bcs idk why it was off center
            squareSize
        );
    }

    // borders
    const borderWidth = cf.BORDERWIDTH;
    const secondBorderDistance = cf.SECONDBORDERDISTANCE;
    // left vertical
    ctx.fillRect(
        squareSize - (borderWidth - 1),
        squareSize - (borderWidth - 1),
        borderWidth,
        squareSize * 8 + (borderWidth - 1) * 2
    );
    ctx.fillRect(
        squareSize - (borderWidth - 1 + secondBorderDistance),
        squareSize - (borderWidth - 1 + secondBorderDistance),
        borderWidth,
        squareSize * 8 + (borderWidth - 1 + secondBorderDistance) * 2
    );
    // right vertical
    ctx.fillRect(
        squareSize * 9 - 1,
        squareSize - (borderWidth - 1),
        borderWidth,
        squareSize * 8 + (borderWidth - 1) * 2
    );
    ctx.fillRect(
        squareSize * 9 - 1 + secondBorderDistance,
        squareSize - (borderWidth - 1 + secondBorderDistance),
        borderWidth,
        squareSize * 8 + (borderWidth - 1 + secondBorderDistance) * 2
    );

    // top horizontal
    ctx.fillRect(
        squareSize - (borderWidth - 1),
        squareSize - (borderWidth - 1),
        squareSize * 8 + (borderWidth - 1) * 2,
        borderWidth
    );
    ctx.fillRect(
        squareSize - (borderWidth - 1 + secondBorderDistance),
        squareSize - (borderWidth - 1 + secondBorderDistance),
        squareSize * 8 + (borderWidth - 1 + secondBorderDistance) * 2,
        borderWidth
    );
    // bottom horizontal
    ctx.fillRect(
        squareSize - (borderWidth - 1),
        squareSize * 9 - 1,
        squareSize * 8 + (borderWidth - 1) * 2,
        borderWidth
    );
    ctx.fillRect(
        squareSize - (borderWidth - 1 + secondBorderDistance),
        squareSize * 9 - 1 + secondBorderDistance,
        squareSize * 8 + (borderWidth - 1 + secondBorderDistance) * 2,
        borderWidth
    );
}

function initBoard() {
    const cBoardLayer = document.getElementById(
        'board-layer'
    ) as HTMLCanvasElement;
    const ctxBoardLayer = cBoardLayer.getContext('2d');
    cBoardLayer.width = cf.BOARDSIZE;
    cBoardLayer.height = cf.BOARDSIZE;

    if (ctxBoardLayer === null) {
        console.error("ctxBoardLayer is null, can't conitnue");
        return;
    }
    drawBoard(ctxBoardLayer);
}

export { initBoard };
