import type { Vector2D, VectorRankFile } from '../types/vector2d';
import * as cf from '../conifg';

export function getScreenPosition(
    rankIndex: number,
    fileIndex: number,
    isWhitePerspective?: boolean
): Vector2D;
export function getScreenPosition(
    vec: VectorRankFile,
    isWhitePerspective?: boolean
): Vector2D;

export function getScreenPosition(
    rankOrVec: number | VectorRankFile,
    fileOrPerspective: number | boolean = true,
    isWhitePerspective: boolean = true
): Vector2D {
    let rankIndex: number;
    let fileIndex: number;
    let perspective: boolean;

    if (typeof rankOrVec === 'number') {
        rankIndex = rankOrVec;
        fileIndex = fileOrPerspective as number;
        perspective = isWhitePerspective;
    } else {
        rankIndex = rankOrVec.rank;
        fileIndex = rankOrVec.file;
        perspective = (fileOrPerspective as boolean) ?? true;
    }

    const visualRow = perspective ? 8 - rankIndex : rankIndex + 1;
    const visualCol = perspective ? fileIndex + 1 : 8 - fileIndex;

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
