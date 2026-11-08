import * as cf from './conifg';
import type { Board } from './game/board';
import { boardToImageMapper } from './helpers/boardTypeToImage';
import {
    getRankAndFile,
    getScreenPosition,
} from './helpers/positionNormalizers';
import type { Vector2D, VectorRankFile } from './types/vector2d';

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
    draggedPosition: VectorRankFile | null;

    constructor(board: Board) {
        this.draggedPosition = null;
        this.isDragging = false;
        this.currentlyDraggedImage = null;

        this.boardRef = board;
        this.boardRef.setMoveCallback(this.moveCallback.bind(this));

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
        this.drawPieces();
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

            coords.push({ x: fileIndex, y: rankIndex });
            board &= board - 1n;
        }

        return coords;
    }

    private drawPieces() {
        if (this.ctxPiecesLayer === null)
            throw new Error('Pieces context layer is null');
        this.ctxPiecesLayer.clearRect(0, 0, cf.BOARDSIZE, cf.BOARDSIZE);
        const map = new Map<() => bigint, HTMLImageElement>([
            [this.boardRef.getWhitePawns, cf.WHITEPAWNIMAGE],
            [this.boardRef.getWhiteBishops, cf.WHITEBISHOPIMAGE],
            [this.boardRef.getWhiteKings, cf.WHITEKINGIMAGE],
            [this.boardRef.getWhiteKnights, cf.WHITEKNIGHTIMAGE],
            [this.boardRef.getWhiteQueens, cf.WHITEQUEENIMAGE],
            [this.boardRef.getWhiteRooks, cf.WHITEROOKIMAGE],

            [this.boardRef.getBlackBishops, cf.BLACKBISHOPIMAGE],
            [this.boardRef.getBlackKings, cf.BLACKKINGIMAGE],
            [this.boardRef.getBlackKnights, cf.BLACKKNIGHTIMAGE],
            [this.boardRef.getBlackPawns, cf.BLACKPAWNIMAGE],
            [this.boardRef.getBlackQueens, cf.BLACKQUEENIMAGE],
            [this.boardRef.getBlackRooks, cf.BLACKROOKIMAGE],
        ]);

        for (const [func, image] of map) {
            const coordinates = this.getPieceCoordinates(func());
            for (const { x: fileIndex, y: rankIndex } of coordinates) {
                const { x, y } = getScreenPosition(
                    rankIndex + 1,
                    fileIndex + 1
                );
                this.ctxPiecesLayer.drawImage(
                    image,
                    x,
                    y,
                    cf.SQURESIZE,
                    cf.SQURESIZE
                );
            }
        }
    }

    private definePath(coords: Vector2D) {
        const ctx = this.ctxDragLayer;
        if (!ctx) throw new Error('Define path ctx error');
        ctx.beginPath();
        const { x, y } = getScreenPosition(coords.y + 1, coords.x + 1);
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

        const piece = this.boardRef.getPieceTypeAndColour({
            file,
            rank,
        });

        if (!piece) {
            console.log('No piece');
            return;
        }

        this.draggedPosition = { rank, file };
        this.currentlyDraggedImage = boardToImageMapper(
            piece.colour,
            piece.piece
        );
        const position = getScreenPosition(rank + 1, file + 1);
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

    private handleMouseUp(ev: MouseEvent): void {
        // validate if on board square later
        const x: number = this.normalizeX(ev.clientX);
        const y: number = this.normalizeY(ev.clientY);
        const { x: file, y: rank } = getRankAndFile({ x, y });

        if (!this.draggedPosition)
            throw new Error(
                'Mouse up vaiable but dragged posotion is not assigned?'
            );
        const success = this.boardRef.makeAMove(
            {
                file: this.draggedPosition.file,
                rank: this.draggedPosition.rank,
            },
            {
                file,
                rank,
            }
        );

        if (success) {
            this.ctxDragLayer?.clearRect(0, 0, cf.BOARDSIZE, cf.BOARDSIZE);
            this.currentlyDraggedImage = null;
            this.isDragging = false;
        } else this.cleanUpDrag();
    }

    private handleMouseOut(): void {
        this.cleanUpDrag();
    }

    private cleanUpDrag() {
        if (!this.currentlyDraggedImage || !this.draggedPosition) return;

        const pos = getScreenPosition(
            this.draggedPosition.rank + 1,
            this.draggedPosition.file + 1
        );
        this.ctxPiecesLayer?.drawImage(
            this.currentlyDraggedImage,
            pos.x,
            pos.y,
            cf.SQURESIZE,
            cf.SQURESIZE
        );
        this.ctxDragLayer?.clearRect(0, 0, cf.BOARDSIZE, cf.BOARDSIZE);
        this.currentlyDraggedImage = null;
        this.isDragging = false;
    }

    // Technically if there was no plan for player vs computer this wouldnt be required
    private moveCallback(): void {
        this.drawPieces();
        this.piecesTurn = this.boardRef.getAll(
            this.boardRef.getCurrentColourTrun()
        );
        this.piecesTurnCoords = this.getPieceCoordinates(this.piecesTurn);
    }
}
