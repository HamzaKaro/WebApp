import { Letter } from '@app/classes/board/letter';
import { NUMBER_OF_TILES_IN_EASEL, tilesValues } from '@app/constants/board-constants';
import { LetterState } from '@app/enums/letter-state';

export class ExchangeStringService {
    static exchangeCommand(easel: (Letter | undefined)[]): string {
        const tilesToExchange = this.extractTilesToExchange(easel);
        let exchangeInstruction = '!échanger ';

        tilesToExchange.forEach((letter: Letter) => {
            exchangeInstruction += letter.isJoker ? '*' : letter.char.toLowerCase();
        });

        return exchangeInstruction;
    }

    static extractTilesToExchange(easel: (Letter | undefined)[]): Letter[] {
        const tilesToExchange: Letter[] = [];
        easel.forEach((value) => {
            if (value?.state === LetterState.Exchange) {
                tilesToExchange.push(value);
            }
        });
        return tilesToExchange;
    }

    static updateEasel(easel: (Letter | undefined)[], data: string) {
        for (let i = 0; i < data.length; i++) {
            if (data[i] === '*') {
                easel[i] = Letter.notPlaced('*', tilesValues.get(data[i]) ?? 0);
                if (easel[i] !== undefined) {
                    (easel[i] as Letter).isJoker = true;
                }
            } else {
                easel[i] = Letter.notPlaced(data[i], tilesValues.get(data[i]) ?? 0);
            }
        }
        if (data.length < NUMBER_OF_TILES_IN_EASEL) {
            for (let i = data.length; i < NUMBER_OF_TILES_IN_EASEL; i++) {
                easel[i] = undefined;
            }
        }
    }
}
