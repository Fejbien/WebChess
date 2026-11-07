const RANKCOUNT: number = 8;
type bit = 0 | 1;

const BoardEnum = {
    nWhite: 0,
    nBlack: 1,
    nPawn: 2,
    nKnight: 3,
    nBishop: 4,
    nRook: 5,
    nQueen: 6,
    nKing: 7,
} as const;
type BoardEnum = (typeof BoardEnum)[keyof typeof BoardEnum];

const PieceEnum = {
    pawn: 2,
    knight: 3,
    bishop: 4,
    rook: 5,
    queen: 6,
    king: 7,
} as const;
type PieceEnum = (typeof PieceEnum)[keyof typeof PieceEnum];

const ColourEnum = {
    white: 0,
    black: 1,
} as const;
type ColourEnum = (typeof ColourEnum)[keyof typeof ColourEnum];

const pieceMapper: Map<string, PieceEnum> = new Map([
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

const isNumber = (charCode: number): boolean =>
    charCode >= 48 && charCode <= 57;

const isLowerCase = (charCode: number): boolean =>
    charCode >= 97 && charCode <= 122;

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

        for (let i: number = 0; i < RANKCOUNT; i++) {
            let file: number = 0;
            for (let j: number = 0; j < rankSplit[i].length; j++) {
                if (isNumber(rankSplit[i].charCodeAt(file))) {
                    file += Number(rankSplit[i].charAt(file));
                    continue;
                }

                const colour: ColourEnum = isLowerCase(
                    rankSplit[i].charCodeAt(file)
                )
                    ? ColourEnum.black
                    : ColourEnum.white;

                this.setPiece(
                    i,
                    file,
                    colour,
                    pieceMapper.get(rankSplit[i].charAt(file))
                );

                file++;
            }
        }
    }

    private setPiece(
        rankIndex: number,
        fileIndex: number,
        color: ColourEnum,
        piece: PieceEnum | undefined,
        bit: bit = 1
    ) {
        const index: number = 8 * rankIndex + fileIndex;
        this.pieceBoardArr[color];
        const mask = 1n << BigInt(index);

        if (!piece) throw Error('Undefined piece');

        if (bit === 1) {
            this.pieceBoardArr[piece] |= mask;
            this.pieceBoardArr[color] |= mask;
        } else {
            this.pieceBoardArr[piece] & ~mask;
            this.pieceBoardArr[color] & ~mask;
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
