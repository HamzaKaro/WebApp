import { MultiplierType } from '@app/enums/multiplayer-type';
import { Coordinate } from './coordinate';

export class SpecialSquares {
    coordinate: Coordinate;
    multiplierType: MultiplierType;
    multiplierValue: number;
    isStar: boolean;

    constructor(coordinate: Coordinate, multiplierType: MultiplierType, multiplierValue: number, isStar: boolean) {
        this.coordinate = coordinate;
        this.multiplierType = multiplierType;
        this.multiplierValue = multiplierValue;
        this.isStar = isStar;
    }
}
