import { RANKCOUNT } from '../../conifg';
import { isLowerCase, isNumber } from '../../helpers/isHelpers';
import {
    BoardEnum,
    ColourEnum,
    PieceEnum,
    type Bit,
} from '../../types/boardEnums';

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

    constructor(
        fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    ) {
        this.pieceBoardArr = new Array(RANKCOUNT).fill(0n);
        this.setUpPieces(fen);
    }

    private setUpPieces(fen: string) {
        const endPiecePart: number = fen.indexOf(' ');
        // the idea is to add deafult setting if not added but for now lets just ignore it and assume its always correct
        const ranks: string = fen.slice(0, endPiecePart);
        const rankSplit: string[] = ranks.split('/');

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
        color: ColourEnum,
        piece: PieceEnum | undefined,
        bit: Bit = 1
    ) {
        const index: number = 8 * rankIndex + fileIndex;
        this.pieceBoardArr[color];
        const mask = 1n << BigInt(index);

        if (!piece) throw Error('Undefined piece');

        if (bit === 1) {
            this.pieceBoardArr[piece] |= mask;
            this.pieceBoardArr[color] |= mask;
        } else {
            this.pieceBoardArr[piece] &= ~mask;
            this.pieceBoardArr[color] &= ~mask;
        }
    }

    // Pawns
    public getWhitePawns = (): bigint =>
        this.pieceBoardArr[BoardEnum.nPawn] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackPawns = (): bigint =>
        this.pieceBoardArr[BoardEnum.nPawn] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getPawns = (color: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nPawn] & this.pieceBoardArr[color];

    // Knights
    public getWhiteKnights = (): bigint =>
        this.pieceBoardArr[BoardEnum.nKnight] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackKnights = (): bigint =>
        this.pieceBoardArr[BoardEnum.nKnight] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getKnights = (color: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nKnight] & this.pieceBoardArr[color];

    // Bishops
    public getWhiteBishops = (): bigint =>
        this.pieceBoardArr[BoardEnum.nBishop] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackBishops = (): bigint =>
        this.pieceBoardArr[BoardEnum.nBishop] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getBishops = (color: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nBishop] & this.pieceBoardArr[color];

    // Rooks
    public getWhiteRooks = (): bigint =>
        this.pieceBoardArr[BoardEnum.nRook] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackRooks = (): bigint =>
        this.pieceBoardArr[BoardEnum.nRook] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getRooks = (color: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nRook] & this.pieceBoardArr[color];

    // Queens
    public getWhiteQueens = (): bigint =>
        this.pieceBoardArr[BoardEnum.nQueen] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackQueens = (): bigint =>
        this.pieceBoardArr[BoardEnum.nQueen] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getQueens = (color: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nQueen] & this.pieceBoardArr[color];

    // Kings
    public getWhiteKings = (): bigint =>
        this.pieceBoardArr[BoardEnum.nKing] &
        this.pieceBoardArr[BoardEnum.nWhite];

    public getBlackKings = (): bigint =>
        this.pieceBoardArr[BoardEnum.nKing] &
        this.pieceBoardArr[BoardEnum.nBlack];

    public getKings = (color: ColourEnum): bigint =>
        this.pieceBoardArr[BoardEnum.nKing] & this.pieceBoardArr[color];
}
