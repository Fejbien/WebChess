import { RANKCOUNT } from '../conifg';
import { isLowerCase, isNumber } from '../helpers/isHelpers';
import {
    BoardEnum,
    ColourEnum,
    PieceEnum,
    type Bit,
} from '../types/boardEnums';
import type { VectorRankFile } from '../types/vector2d';

export const pieceMapper: Map<string, PieceEnum> = new Map([
    ['p', PieceEnum.pawn],
    ['n', PieceEnum.knight],
    ['b', PieceEnum.bishop],
    ['r', PieceEnum.rook],
    ['q', PieceEnum.queen],
    ['k', PieceEnum.king],
    // Just so i dont have to "toLower" for each letter
    ['P', PieceEnum.pawn],
    ['N', PieceEnum.knight],
    ['B', PieceEnum.bishop],
    ['R', PieceEnum.rook],
    ['Q', PieceEnum.queen],
    ['K', PieceEnum.king],
]);

export class Board {
    pieceBoardArr: bigint[];
    move: ColourEnum;

    moveCallback: () => void;

    constructor(
        fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    ) {
        this.pieceBoardArr = new Array(RANKCOUNT).fill(0n);
        this.move = ColourEnum.white;
        this.moveCallback = (): void => {
            console.warn('Move callback is not assigned');
        };

        this.setUpPieces(fen);
    }

    private setUpPieces(fen: string) {
        const endPiecePart: number = fen.indexOf(' ');
        // the idea is to add deafult setting if not added but for now lets just ignore it and assume its always correct
        const ranks: string = fen.slice(0, endPiecePart);
        const rest: string[] = fen.slice(endPiecePart).trim().split(/\s+/);
        const rankSplit: string[] = ranks.split('/');

        if (rest[0] === 'w') this.move = ColourEnum.white;
        else this.move = ColourEnum.black;

        for (let i = 0; i < RANKCOUNT; i++) {
            const rankIndex = 7 - i;
            let fileIndex = 0;

            for (let j = 0; j < rankSplit[i].length; j++) {
                const charCode = rankSplit[i].charCodeAt(j);
                const char = rankSplit[i].charAt(j);

                if (isNumber(charCode)) {
                    fileIndex += Number(char);
                    continue;
                }

                const colour: ColourEnum = isLowerCase(charCode)
                    ? ColourEnum.black
                    : ColourEnum.white;

                this.setPiece(
                    rankIndex,
                    fileIndex,
                    colour,
                    pieceMapper.get(char)
                );

                fileIndex++;
            }
        }
    }

    private setPiece(
        rankIndex: number,
        fileIndex: number,
        colour: ColourEnum,
        piece: PieceEnum | undefined,
        bit: Bit = 1
    ) {
        const mask = this.getMaskFromRankAndFile(rankIndex, fileIndex);

        if (!piece) throw Error('Undefined piece');

        if (bit === 1) {
            this.pieceBoardArr[piece] |= mask;
            this.pieceBoardArr[colour] |= mask;
        } else {
            this.pieceBoardArr[piece] &= ~mask;
            this.pieceBoardArr[colour] &= ~mask;
        }
    }

    private getMask = (index: number): bigint => 1n << BigInt(index);
    private getMaskFromRankAndFile = (rank: number, file: number): bigint =>
        this.getMask(rank * 8 + file);

    public getCurrentColourTrun = (): ColourEnum => this.move;

    // Add chechking for iff the move is even possible later dont care for now
    public makeAMove(from: VectorRankFile, to: VectorRankFile): boolean {
        if (this.isPlaceTaken(to)) return false;
        if (!this.isPlaceTaken(from)) return false;

        const pieceAndColour = this.getPieceTypeAndColour(from);
        if (!pieceAndColour)
            throw new Error(
                'Make a move from piece is not existing, shouldnt happend'
            );

        this.setPiece(
            from.rank,
            from.file,
            pieceAndColour.colour,
            pieceAndColour.piece,
            0
        );
        this.setPiece(
            to.rank,
            to.file,
            pieceAndColour.colour,
            pieceAndColour.piece,
            1
        );

        if (this.move === ColourEnum.white) this.move = ColourEnum.black;
        else this.move = ColourEnum.white;

        this.moveCallback();
        return true;
    }

    public setMoveCallback(func: () => void) {
        this.moveCallback = func;
    }

    public isPlaceTaken(coords: VectorRankFile): boolean {
        const mask = this.getMaskFromRankAndFile(coords.rank, coords.file);
        return (
            ((this.pieceBoardArr[ColourEnum.white] |
                this.pieceBoardArr[ColourEnum.black]) &
                mask) !==
            0n
        );
    }

    // All colours
    public getAllWhite = (): bigint => this.pieceBoardArr[BoardEnum.nWhite];
    public getAllBlack = (): bigint => this.pieceBoardArr[BoardEnum.nBlack];
    public getAll = (colour: ColourEnum) => this.pieceBoardArr[colour];

    // Single piece
    public getPieceTypeAndColour = (
        coords: VectorRankFile
    ): {
        colour: ColourEnum;
        piece: PieceEnum;
    } | null => {
        const piece = this.getPieceType(coords);
        const colour = this.getPieceColour(coords);

        // bcs of colour white being 0 "piece && colour" always evaluated to false lmfao
        if (piece && colour !== null) return { colour, piece };
        return null;
    };
    public getPieceType = (coords: VectorRankFile): PieceEnum | null => {
        const mask = this.getMaskFromRankAndFile(coords.rank, coords.file);
        for (const value of Object.values(PieceEnum)) {
            if ((this.pieceBoardArr[value] & mask) !== 0n) return value;
        }
        return null;
    };
    public getPieceColour = (coords: VectorRankFile): ColourEnum | null => {
        const mask = this.getMaskFromRankAndFile(coords.rank, coords.file);
        for (const value of Object.values(ColourEnum)) {
            if ((this.pieceBoardArr[value] & mask) !== 0n) return value;
        }
        return null;
    };

    // Pawns
    public getWhitePawns = (): bigint =>
        this.pieceBoardArr[BoardEnum.nPawn] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackPawns = (): bigint =>
        this.pieceBoardArr[BoardEnum.nPawn] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getPawns = (colour: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nPawn] & this.pieceBoardArr[colour];

    // Knights
    public getWhiteKnights = (): bigint =>
        this.pieceBoardArr[BoardEnum.nKnight] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackKnights = (): bigint =>
        this.pieceBoardArr[BoardEnum.nKnight] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getKnights = (colour: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nKnight] & this.pieceBoardArr[colour];

    // Bishops
    public getWhiteBishops = (): bigint =>
        this.pieceBoardArr[BoardEnum.nBishop] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackBishops = (): bigint =>
        this.pieceBoardArr[BoardEnum.nBishop] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getBishops = (colour: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nBishop] & this.pieceBoardArr[colour];

    // Rooks
    public getWhiteRooks = (): bigint =>
        this.pieceBoardArr[BoardEnum.nRook] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackRooks = (): bigint =>
        this.pieceBoardArr[BoardEnum.nRook] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getRooks = (colour: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nRook] & this.pieceBoardArr[colour];

    // Queens
    public getWhiteQueens = (): bigint =>
        this.pieceBoardArr[BoardEnum.nQueen] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackQueens = (): bigint =>
        this.pieceBoardArr[BoardEnum.nQueen] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getQueens = (colour: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nQueen] & this.pieceBoardArr[colour];

    // Kings
    public getWhiteKings = (): bigint =>
        this.pieceBoardArr[BoardEnum.nKing] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackKings = (): bigint =>
        this.pieceBoardArr[BoardEnum.nKing] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getKings = (colour: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nKing] & this.pieceBoardArr[colour];
}
