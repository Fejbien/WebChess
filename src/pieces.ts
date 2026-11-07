import * as cf from './conifg';
import type { Board } from './game/classes/board';
import type { Vector2D } from './types/vector2d';

export class PiecesScreenHandling {
    boardRef: Board;

    cPiecesLayer: HTMLCanvasElement;
    ctxPiecesLayer: CanvasRenderingContext2D | null;

    cDragLayer: HTMLCanvasElement;
    ctxDragLayer: CanvasRenderingContext2D | null;

    constructor(board: Board) {
        this.boardRef = board;

        // Pieces layer
        this.cPiecesLayer = document.getElementById(
            'pieces-layer'
        ) as HTMLCanvasElement;
        if (!this.cPiecesLayer) throw new Error('Pieces layer not found');

        this.ctxPiecesLayer = this.cPiecesLayer.getContext('2d');
        this.cPiecesLayer.width = cf.BOARDSIZE;
        this.cPiecesLayer.height = cf.BOARDSIZE;

        if (this.ctxPiecesLayer === null)
            throw new Error('Pieces context layer is null');

        // Drag layer
        this.cDragLayer = document.getElementById(
            'drag-layer'
        ) as HTMLCanvasElement;
        if (!this.cDragLayer) throw new Error('Drag layer not found');

        this.ctxDragLayer = this.cDragLayer.getContext('2d');
        this.cDragLayer.width = cf.BOARDSIZE;
        this.cDragLayer.height = cf.BOARDSIZE;

        if (this.ctxDragLayer === null)
            throw new Error('Drag context layer is null');

        // Other
        this.drawPieces(this.ctxPiecesLayer, this.boardRef);
        this.cDragLayer.onmousemove = this.handleMouseMove.bind(this);
    }

    private getScreenPosition(
        rankIndex: number,
        fileIndex: number,
        isWhitePerspective: boolean = true
    ): Vector2D {
        const visualRow = isWhitePerspective ? 9 - rankIndex : rankIndex;
        const visualCol = isWhitePerspective ? fileIndex : 9 - fileIndex;

        return {
            x: visualCol * cf.SQURESIZE,
            y: visualRow * cf.SQURESIZE,
        };
    }

    private getPieceCoordinates(bitboard: bigint): Vector2D[] {
        const coords: Vector2D[] = [];
        let board = bitboard;

        while (board > 0n) {
            const ls1b = board & -board;
            const squareIndex = Math.log2(Number(ls1b));
            const fileIndex = squareIndex & 7;
            const rankIndex = squareIndex >> 3;

            coords.push({ x: rankIndex + 1, y: fileIndex + 1 });
            board &= board - 1n;
        }

        return coords;
    }

    private drawPieces(ctx: CanvasRenderingContext2D, board: Board) {
        const map = new Map<() => bigint, HTMLImageElement>([
            [board.getWhitePawns, cf.WHITEPAWNIMAGE],
            [board.getWhiteBishops, cf.WHITEBISHOPIMAGE],
            [board.getWhiteKings, cf.WHITEKINGIMAGE],
            [board.getWhiteKnights, cf.WHITEKNIGHTIMAGE],
            [board.getWhiteQueens, cf.WHITEQUEENIMAGE],
            [board.getWhiteRooks, cf.WHITEROOKIMAGE],

            [board.getBlackBishops, cf.BLACKBISHOPIMAGE],
            [board.getBlackKings, cf.BLACKKINGIMAGE],
            [board.getBlackKnights, cf.BLACKKNIGHTIMAGE],
            [board.getBlackPawns, cf.BLACKPAWNIMAGE],
            [board.getBlackQueens, cf.BLACKQUEENIMAGE],
            [board.getBlackRooks, cf.BLACKROOKIMAGE],
        ]);

        for (const [func, image] of map) {
            const coordinates = this.getPieceCoordinates(func());
            for (const { x: rankIndex, y: fileIndex } of coordinates) {
                const { x, y } = this.getScreenPosition(rankIndex, fileIndex);
                ctx.drawImage(image, x, y, cf.SQURESIZE, cf.SQURESIZE);
            }
        }
    }

    private definePath(coords: Vector2D) {
        const ctx = this.ctxDragLayer;
        if (!ctx) throw new Error('Define path ctx error');
        ctx.beginPath();
        const { x, y } = this.getScreenPosition(coords.x, coords.y);
        ctx.moveTo(x, y);
        ctx.lineTo(x + cf.SQURESIZE, y);
        ctx.lineTo(x + cf.SQURESIZE, y + cf.SQURESIZE);
        ctx.lineTo(x, y + cf.SQURESIZE);
        ctx.closePath();
    }

    private handleMouseMove(ev: MouseEvent): void {
        const pieces: bigint = this.boardRef.getAll(
            this.boardRef.getCurrentColourTrun()
        );

        const coordinates: Vector2D[] = this.getPieceCoordinates(pieces);
        const x: number =
            ev.clientX - this.cDragLayer.getBoundingClientRect().x;
        const y: number =
            ev.clientY - this.cDragLayer.getBoundingClientRect().y;

        for (const coordinate of coordinates) {
            this.definePath(coordinate);
            if (this.ctxDragLayer?.isPointInPath(x, y)) {
                this.cDragLayer.style.cursor = 'pointer';
                break;
            } else this.cDragLayer.style.cursor = 'default';
        }
    }
}
