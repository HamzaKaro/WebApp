import { Letter } from '@app/classes/board/letter';
import { DEFAULT_CASE_COUNT } from '@app/constants/board-constants';

export class Coordinate {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    move(newCoordinate: Coordinate) {
        this.x = newCoordinate.x;
        this.y = newCoordinate.y;
    }

    isEqual(other: Coordinate) {
        if (this.x === other.x && this.y === other.y) return true;
        return false;
    }

    next(orientation: string) {
        if (orientation === 'h') {
            this.x += 1;
        } else if (orientation === 'v') {
            this.y += 1;
        }
    }

    after(isHorizontal: boolean, placedLetters: (Letter | undefined)[][]) {
        do {
            if (isHorizontal) {
                this.x += 1;
            } else {
                this.y += 1;
            }
        } while (this.x < DEFAULT_CASE_COUNT && this.y < DEFAULT_CASE_COUNT && this.squareIsAvailable(placedLetters));
    }
    before(isHorizontal: boolean, placedLetters: (Letter | undefined)[][]) {
        do {
            if (isHorizontal) {
                this.x -= 1;
            } else {
                this.y -= 1;
            }
        } while (this.x > 0 && this.y > 0 && this.squareIsAvailable(placedLetters));
    }
    isValid(): boolean {
        if (this.x > 0 && this.x < DEFAULT_CASE_COUNT && this.y > 0 && this.y < DEFAULT_CASE_COUNT) return true;
        return false;
    }
    private squareIsAvailable(placedLetters: (Letter | undefined)[][]) {
        if (placedLetters[this.x][this.y] !== undefined) return true;
        return false;
    }
}
