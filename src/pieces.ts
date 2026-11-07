import * as cf from './conifg';
import type { Board } from './game/classes/board';
import { boardToImageMapper } from './helpers/boardTypeToImage';
import {
    getRankAndFile,
    getScreenPosition,
} from './helpers/positionNormalizers';
import { stringNamingBoardEnumMap } from './types/boardEnums';
import type { Vector2D } from './types/vector2d';

export class PiecesScreenHandling {
    boardRef: Board;

    cPiecesLayer: HTMLCanvasElement;
    ctxPiecesLayer: CanvasRenderingContext2D | null;

    cDragLayer: HTMLCanvasElement;
    ctxDragLayer: CanvasRenderingContext2D | null;

    layerBoundingX: number;
    layerBoundingY: number;

    piecesTurn: bigint;
    piecesTurnCoords: Vector2D[];

    isDragging: boolean;
    currentlyDraggedImage: HTMLImageElement | null;
    draggedPosition: Vector2D | null;

    constructor(board: Board) {
        this.draggedPosition = null;
        this.isDragging = false;
        this.currentlyDraggedImage = null;

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
        this.layerBoundingX = this.cDragLayer.getBoundingClientRect().x;
        this.layerBoundingY = this.cDragLayer.getBoundingClientRect().y;
        this.drawPieces(this.ctxPiecesLayer, this.boardRef);
        // Should add to change on move to other one or skip enitrlely by like flag ai_move
        // and like the coordinates as well, so this wont be realucalter everytime
        this.piecesTurn = this.boardRef.getAll(
            this.boardRef.getCurrentColourTrun()
        );
        this.piecesTurnCoords = this.getPieceCoordinates(this.piecesTurn);

        this.cDragLayer.onmousemove = this.handleMouseMove.bind(this);
        this.cDragLayer.onmousedown = this.handleMouseDown.bind(this);
        this.cDragLayer.onmouseup = this.handleMouseUp.bind(this);
        this.cDragLayer.onmouseout = this.handleMouseOut.bind(this);

        window.addEventListener('resize', this.handleResize);
    }

    private handleResize = () => {
        const rect = this.cDragLayer.getBoundingClientRect();
        this.layerBoundingX = rect.x;
        this.layerBoundingY = rect.y;
    };

    private normalizeX = (x: number): number => x - this.layerBoundingX;
    private normalizeY = (y: number): number => y - this.layerBoundingY;

    private getPieceCoordinates(bitboard: bigint): Vector2D[] {
        const coords: Vector2D[] = [];
        let board = bitboard;

        while (board > 0n) {
            const ls1b = board & -board;
            const squareIndex = Math.log2(Number(ls1b));
            const fileIndex = squareIndex & 7;
            const rankIndex = squareIndex >> 3;

            coords.push({ x: fileIndex + 1, y: rankIndex + 1 });
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
            for (const { x: fileIndex, y: rankIndex } of coordinates) {
                const { x, y } = getScreenPosition(rankIndex, fileIndex);
                ctx.drawImage(image, x, y, cf.SQURESIZE, cf.SQURESIZE);
            }
        }
    }

    private definePath(coords: Vector2D) {
        const ctx = this.ctxDragLayer;
        if (!ctx) throw new Error('Define path ctx error');
        ctx.beginPath();
        const { x, y } = getScreenPosition(coords.y, coords.x);
        ctx.moveTo(x, y);
        ctx.lineTo(x + cf.SQURESIZE, y);
        ctx.lineTo(x + cf.SQURESIZE, y + cf.SQURESIZE);
        ctx.lineTo(x, y + cf.SQURESIZE);
        ctx.closePath();
    }

    private handleMouseMove(ev: MouseEvent): void {
        if (this.isDragging) {
            const ctx = this.ctxDragLayer;
            if (!ctx) throw new Error('Drag layer cts null');
            ctx.clearRect(0, 0, cf.BOARDSIZE, cf.BOARDSIZE);
            if (!this.currentlyDraggedImage) return;
            ctx.drawImage(
                this.currentlyDraggedImage,
                this.normalizeX(ev.clientX) - cf.SQURESIZE / 2,
                this.normalizeY(ev.clientY) - cf.SQURESIZE / 2,
                cf.SQURESIZE,
                cf.SQURESIZE
            );
        } else {
            const x: number = this.normalizeX(ev.clientX);
            const y: number = this.normalizeY(ev.clientY);

            for (const coordinate of this.piecesTurnCoords) {
                this.definePath(coordinate);
                if (this.ctxDragLayer?.isPointInPath(x, y)) {
                    this.cDragLayer.style.cursor = 'pointer';
                    break;
                } else this.cDragLayer.style.cursor = 'default';
            }
        }
    }

    private handleMouseDown(ev: MouseEvent): void {
        const x: number = this.normalizeX(ev.clientX);
        const y: number = this.normalizeY(ev.clientY);

        const { x: file, y: rank } = getRankAndFile({ x, y });

        // -1 bcs we draw board on a 1 - 8 while keeping board interanlly as 0 - 7
        const piece = this.boardRef.getPieceTypeAndColour({
            file: file - 1,
            rank: rank - 1,
        });

        if (!piece) {
            console.log('No piece');
            return;
        }

        console.log(
            stringNamingBoardEnumMap.get(piece.colour) +
                ' : ' +
                stringNamingBoardEnumMap.get(piece.piece)
        );

        this.currentlyDraggedImage = boardToImageMapper(
            piece.colour,
            piece.piece
        );
        const position = getScreenPosition(rank, file);
        this.draggedPosition = position;
        this.ctxPiecesLayer?.clearRect(
            position.x,
            position.y,
            cf.SQURESIZE,
            cf.SQURESIZE
        );
        this.isDragging = true;
        // Just so it draws instatly, without it it would not display piece till a mouse moves
        this.handleMouseMove(ev);
    }

    private handleMouseUp(): void {
        this.cleanUpDrag();
    }

    private handleMouseOut(): void {
        this.cleanUpDrag();
    }

    private cleanUpDrag() {
        if (!this.currentlyDraggedImage || !this.draggedPosition)
            throw new Error('Clean up error');

        this.ctxPiecesLayer?.drawImage(
            this.currentlyDraggedImage,
            this.draggedPosition.x,
            this.draggedPosition.y,
            cf.SQURESIZE,
            cf.SQURESIZE
        );
        this.ctxDragLayer?.clearRect(0, 0, cf.BOARDSIZE, cf.BOARDSIZE);
        this.currentlyDraggedImage = null;
        this.isDragging = false;
    }
}
