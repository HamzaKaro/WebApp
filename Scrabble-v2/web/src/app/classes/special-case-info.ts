import { Position } from '@app/classes/position';
import { MultiplierType } from '@app/enums/multiplayer-type';
export interface SpecialCaseInfo {
    position: Position;
    multiplierType: MultiplierType;
    multiplierValue: number;
    isStar: boolean;
}
