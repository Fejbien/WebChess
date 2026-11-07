export type Bit = 0 | 1;

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
