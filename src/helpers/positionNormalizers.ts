import type { Vector2D } from '../types/vector2d';
import * as cf from '../conifg';

export function getScreenPosition(
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
export function getRankAndFile(
    vec: Vector2D,
    isWhitePerspective: boolean = true
): Vector2D {
    const screenCol = Math.floor(vec.x / cf.SQURESIZE);
    const screenRow = Math.floor(vec.y / cf.SQURESIZE);

    const rankIndex = isWhitePerspective
        ? cf.RANKCOUNT + 1 - screenRow
        : screenRow;
    const fileIndex = isWhitePerspective
        ? screenCol
        : cf.RANKCOUNT + 1 - screenCol;

    return {
        x: fileIndex - 1,
        y: rankIndex - 1,
    };
}
