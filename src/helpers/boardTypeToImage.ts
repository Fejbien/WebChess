import { ColourEnum, type PieceEnum } from '../types/boardEnums';
import * as cf from '../conifg';

export function boardToImageMapper(
    colour: ColourEnum,
    piece: PieceEnum
): HTMLImageElement {
    if (colour === ColourEnum.white) {
        switch (piece) {
            case 2:
                return cf.WHITEPAWNIMAGE;
            case 3:
                return cf.WHITEKNIGHTIMAGE;
            case 4:
                return cf.WHITEBISHOPIMAGE;
            case 5:
                return cf.WHITEROOKIMAGE;
            case 6:
                return cf.WHITEQUEENIMAGE;
            case 7:
                return cf.WHITEKINGIMAGE;
        }
    } else {
        switch (piece) {
            case 2:
                return cf.BLACKPAWNIMAGE;
            case 3:
                return cf.BLACKKNIGHTIMAGE;
            case 4:
                return cf.BLACKBISHOPIMAGE;
            case 5:
                return cf.BLACKROOKIMAGE;
            case 6:
                return cf.BLACKQUEENIMAGE;
            case 7:
                return cf.BLACKKINGIMAGE;
        }
    }
}
