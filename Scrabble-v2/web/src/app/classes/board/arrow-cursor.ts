import { Coordinate } from './coordinate';

export class ArrowCursor {
    coordinate: Coordinate;
    isHorizontal: boolean;

    constructor(coordinate: Coordinate, isHorizontal: boolean) {
        this.coordinate = coordinate;
        this.isHorizontal = isHorizontal;
    }
}
