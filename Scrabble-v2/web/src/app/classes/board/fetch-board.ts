import { tilesValues } from '@app/constants/board-constants';
import { Coordinate } from './coordinate';
import { Letter } from './letter';

export class FetchBoard {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static initializePlacedLetters(placedLetters: (Letter | undefined)[][], data: any) {
        // data : [string,string]
        const regex = new RegExp('^[a-z]$');

        for (let row = 0; row < data.length; row++) {
            const word: string = data[row];
            for (let index = 0; index < word.length; index++) {
                if (word[index] === ' ') continue;

                if (regex.test(word[index])) {
                    placedLetters[index + 1][row + 1] = Letter.placed(
                        word[index],
                        new Coordinate(index + 1, row + 1),
                        tilesValues.get(word[index]) as number,
                    );
                } else {
                    placedLetters[index + 1][row + 1] = Letter.placedJoker(word[index], new Coordinate(index + 1, row + 1), 0);
                }
            }
        }
    }
}
