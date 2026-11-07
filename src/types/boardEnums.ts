export type Bit = 0 | 1;

// Made to console log nicer
export const stringNamingBoardEnumMap = new Map<number, string>([
    [0, 'white'],
    [1, 'black'],
    [2, 'pawn'],
    [3, 'knight'],
    [4, 'bishop'],
    [5, 'rook'],
    [6, 'queen'],
    [7, 'king'],
]);

export const BoardEnum = {
    nWhite: 0,
    nBlack: 1,
    nPawn: 2,
    nKnight: 3,
    nBishop: 4,
    nRook: 5,
    nQueen: 6,
    nKing: 7,
} as const;
export type BoardEnum = (typeof BoardEnum)[keyof typeof BoardEnum];

export const PieceEnum = {
    pawn: 2,
    knight: 3,
    bishop: 4,
    rook: 5,
    queen: 6,
    king: 7,
} as const;
export type PieceEnum = (typeof PieceEnum)[keyof typeof PieceEnum];

export const ColourEnum = {
    white: 0,
    black: 1,
} as const;
export type ColourEnum = (typeof ColourEnum)[keyof typeof ColourEnum];
