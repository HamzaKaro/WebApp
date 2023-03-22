import { SpecialCaseInfo } from '@app/classes/special-case-info';
import { BubbleTeaTheme } from '@app/enums/board-colors/bubble-tea-theme';
import { DarkTheme } from '@app/enums/board-colors/dark-theme';
import { FallGuysTheme } from '@app/enums/board-colors/fall-guys-theme';
import { HalloweenTheme } from '@app/enums/board-colors/halloween-theme';
import { LightTheme } from '@app/enums/board-colors/light-theme';
import { MinecraftTheme } from '@app/enums/board-colors/minecraft-theme';
import { UniTheme } from '@app/enums/board-colors/uni-theme';
import { MultiplierType } from '@app/enums/multiplayer-type';

export class ColorsManagerSpecialSquares {
    static getColor(theme: string, square: SpecialCaseInfo): string {
        if (square.multiplierType === MultiplierType.LetterMultiplier && square.multiplierValue === 2) {
            return this.doubleLetter(theme);
        } else if (square.multiplierType === MultiplierType.LetterMultiplier && square.multiplierValue === 3) {
            return this.tripleLetter(theme);
        } else if (square.multiplierType === MultiplierType.WordMultiplier && square.multiplierValue === 2) {
            return this.doubleWord(theme);
        } else if (square.multiplierType === MultiplierType.WordMultiplier && square.multiplierValue === 3) {
            return this.tripleWord(theme);
        } else return '';
    }

    static tripleLetter(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.TripleLetterSquare;
            }
            case 'dark': {
                return DarkTheme.TripleLetterSquare;
            }
            case 'uni': {
                return UniTheme.TripleLetterSquare;
            }
            case 'fallGuys': {
                return FallGuysTheme.TripleLetterSquare;
            }
            case 'minecraft': {
                return MinecraftTheme.TripleLetterSquare;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.TripleLetterSquare;
            }
            case 'halloween': {
                return HalloweenTheme.TripleLetterSquare;
            }
            default: {
                // same has light
                return LightTheme.TripleLetterSquare;
            }
        }
    }
    static doubleLetter(theme: string) {
        switch (theme) {
            case 'light': {
                return LightTheme.DoubleLetterSquare;
            }
            case 'dark': {
                return DarkTheme.DoubleLetterSquare;
            }
            case 'uni': {
                return UniTheme.DoubleLetterSquare;
            }
            case 'fallGuys': {
                return FallGuysTheme.DoubleLetterSquare;
            }
            case 'minecraft': {
                return MinecraftTheme.DoubleLetterSquare;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.DoubleLetterSquare;
            }
            case 'halloween': {
                return HalloweenTheme.DoubleLetterSquare;
            }
            default: {
                // same has light
                return LightTheme.DoubleLetterSquare;
            }
        }
    }
    static tripleWord(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.TripleWordSquare;
            }
            case 'dark': {
                return DarkTheme.TripleWordSquare;
            }
            case 'uni': {
                return UniTheme.TripleWordSquare;
            }
            case 'fallGuys': {
                return FallGuysTheme.TripleWordSquare;
            }
            case 'minecraft': {
                return MinecraftTheme.TripleWordSquare;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.TripleWordSquare;
            }
            case 'halloween': {
                return HalloweenTheme.TripleWordSquare;
            }
            default: {
                // same has light
                return LightTheme.TripleWordSquare;
            }
        }
    }
    static doubleWord(theme: string) {
        switch (theme) {
            case 'light': {
                return LightTheme.DoubleWordSquare;
            }
            case 'dark': {
                return DarkTheme.DoubleWordSquare;
            }
            case 'uni': {
                return UniTheme.DoubleWordSquare;
            }
            case 'fallGuys': {
                return FallGuysTheme.DoubleWordSquare;
            }
            case 'minecraft': {
                return MinecraftTheme.DoubleWordSquare;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.DoubleWordSquare;
            }
            case 'halloween': {
                return HalloweenTheme.DoubleWordSquare;
            }
            default: {
                // same has light
                return LightTheme.DoubleWordSquare;
            }
        }
    }
}
