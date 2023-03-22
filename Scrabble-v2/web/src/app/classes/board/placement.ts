/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { tilesValues } from '@app/constants/board-constants';
import { LetterState } from '@app/enums/letter-state';
import { Coordinate } from './coordinate';
import { Letter } from './letter';

export class PlacementString {
    static placementCommand(easel: (Letter | undefined)[], placedLetters: (Letter | undefined)[][]): string {
        const noTilesPlaced = '!placer h4h';

        let orientation = '';
        let placementInstruction = '';

        const tilesToPlace = this.extractTilesToPlace(easel);
        if (tilesToPlace.length === 0) {
            return noTilesPlaced;
        }

        if (this.isPlacementHorizontal(tilesToPlace)) {
            orientation = 'h';
        } else if (this.isPlacementVertical(tilesToPlace)) {
            orientation = 'v';
        } else {
            placementInstruction = '!placer ';
            placementInstruction += this.calculateAlphanumericCoordinate(tilesToPlace[0]);
            placementInstruction += orientation;
            for (const letter of tilesToPlace) {
                placementInstruction += letter.isJoker ? letter.char.toUpperCase() : letter.char.toLowerCase();
                placementInstruction += ' ';
            }
            return placementInstruction;
        }

        tilesToPlace.sort((a, b) => {
            if (a.coordinate?.x === b.coordinate?.x) {
                return a.coordinate!.y - b.coordinate!.y;
            }
            if (!a.coordinate || !b.coordinate) return 0;
            return a.coordinate.x - b.coordinate.x;
        });

        if (this.isPlacementInOneBlock(tilesToPlace, orientation, placedLetters)) {
            placementInstruction = '!placer ';
            placementInstruction += this.calculateAlphanumericCoordinate(tilesToPlace[0]);
            placementInstruction += orientation;
            placementInstruction += ' ';
            for (const tile of tilesToPlace) {
                placementInstruction += tile.isJoker ? tile.char.toUpperCase() : tile.char.toLowerCase();
            }
            return placementInstruction;
        }
        return noTilesPlaced;
    }

    static extractTilesToPlace(easel: (Letter | undefined)[]): Letter[] {
        const lettersToPlace: Letter[] = [];
        easel.forEach((value) => {
            if (value?.state === LetterState.Placement) {
                lettersToPlace.push(value);
            }
        });
        return lettersToPlace;
    }
    static isPlacementHorizontal(lettersToPlace: Letter[]): boolean {
        if (lettersToPlace.length === 1) {
            return true;
        }
        const y = lettersToPlace[0]?.coordinate?.y;
        for (const tile of lettersToPlace) {
            if (tile.coordinate?.y !== y) {
                return false;
            }
        }
        return true;
    }
    static isPlacementVertical(lettersToPlace: Letter[]): boolean {
        const x = lettersToPlace[0]?.coordinate?.x;
        for (const tile of lettersToPlace) {
            if (tile?.coordinate?.x !== x) {
                return false;
            }
        }
        return true;
    }

    static calculateAlphanumericCoordinate(letter: Letter) {
        return String.fromCharCode((letter?.coordinate?.y as number) + 96) + letter?.coordinate?.x.toString();
    }

    static isPlacementInOneBlock(lettersToPlace: Letter[], orientation: string, placedTiles: (Letter | undefined)[][]): boolean {
        let i = 0;

        const coordinate = new Coordinate(lettersToPlace[0]?.coordinate?.x ?? 0, lettersToPlace[0]?.coordinate?.y ?? 0);
        while (i < lettersToPlace.length) {
            if (lettersToPlace[i]?.coordinate?.isEqual(coordinate)) {
                coordinate.next(orientation);
                i++;
            } else if (!placedTiles[coordinate.x][coordinate.y]) {
                return false;
            } else {
                coordinate.next(orientation);
            }
        }
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static updatePlacedLetters(placedLetters: (Letter | undefined)[][], data: any): void {
        const word: string = data.word;
        const orientation: string = data.direction;
        const row: string = data.row;
        const column: number = data.column;

        const coordinate = this.convertRowColumnToCoordinate(row, column);
        let i = 0;

        while (i < word.length) {
            if (placedLetters[coordinate.x][coordinate.y] == null) {
                if (new RegExp('^[a-z]$').test(word[i])) {
                    placedLetters[coordinate.x][coordinate.y] = Letter.placed(
                        word[i],
                        new Coordinate(coordinate.x, coordinate.y),
                        tilesValues.get(word[i]) as number,
                    );
                    i++;
                } else {
                    placedLetters[coordinate.x][coordinate.y] = Letter.placedJoker(word[i], new Coordinate(coordinate.x, coordinate.y), 0);
                    i++;
                }
            }
            coordinate.next(orientation);
        }
    }

    static convertRowColumnToCoordinate(row: string, column: number): Coordinate {
        return new Coordinate(column, row.charCodeAt(0) - 96);
    }
}
