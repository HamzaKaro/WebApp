import { LetterState } from '@app/enums/letter-state';
import { Coordinate } from './coordinate';
import { Position } from './position';

export class Letter {
    position: Position | undefined;
    char: string;
    value: number;
    state: LetterState;
    coordinate: Coordinate | undefined;
    isJoker: boolean;

    constructor() {
        this.position = undefined;
        this.char = '';
        this.value = 0;
        this.state = LetterState.Easel;
        this.coordinate = new Coordinate(0, 0);
        this.isJoker = false;
    }

    static notPlaced(letter: string, value: number): Letter {
        const newLetter = new Letter();
        newLetter.char = letter;
        newLetter.value = value;
        return newLetter;
    }

    static placed(char: string, coordinate: Coordinate, value: number): Letter {
        const newLetter = new Letter();
        newLetter.char = char;
        newLetter.state = LetterState.Fix;
        newLetter.isJoker = false;
        newLetter.coordinate = coordinate;
        newLetter.value = value;
        return newLetter;
    }

    static isJoker(position: Position, char: string, value: number, state: LetterState, coordinate: Coordinate): Letter {
        const newLetter = new Letter();
        newLetter.position = position;
        newLetter.char = char;
        newLetter.value = value;
        newLetter.state = state;
        newLetter.coordinate = coordinate;
        newLetter.isJoker = true;
        return newLetter;
    }

    static placedJoker(char: string, coordinate: Coordinate, value: number): Letter {
        const newLetter = new Letter();
        newLetter.char = char;
        newLetter.state = LetterState.Fix;
        newLetter.coordinate = coordinate;
        newLetter.value = value;
        newLetter.isJoker = true;
        return newLetter;
    }
}
