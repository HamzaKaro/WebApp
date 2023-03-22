/* eslint-disable max-lines */
import { SpecialCaseInfo } from '@app/classes/special-case-info';
import { BubbleTeaTheme } from '@app/enums/board-colors/bubble-tea-theme';
import { DarkTheme } from '@app/enums/board-colors/dark-theme';
import { FallGuysTheme } from '@app/enums/board-colors/fall-guys-theme';
import { HalloweenTheme } from '@app/enums/board-colors/halloween-theme';
import { LightTheme } from '@app/enums/board-colors/light-theme';
import { MinecraftTheme } from '@app/enums/board-colors/minecraft-theme';
import { UniTheme } from '@app/enums/board-colors/uni-theme';
import { LetterState } from '@app/enums/letter-state';
import { ColorsManagerSpecialSquares } from './colors-manager-special-squares';
import { Letter } from './letter';

export class ColorsManager {
    static getArrowCursorColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.ArrowCursorBackground;
            }
            case 'dark': {
                return DarkTheme.ArrowCursorBackground;
            }
            case 'uni': {
                return UniTheme.ArrowCursorBackground;
            }
            case 'fallGuys': {
                return FallGuysTheme.ArrowCursorBackground;
            }
            case 'minecraft': {
                return MinecraftTheme.ArrowCursorBackground;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.ArrowCursorBackground;
            }
            case 'halloween': {
                return HalloweenTheme.ArrowCursorBackground;
            }
            default: {
                // same has light
                return LightTheme.ArrowCursorBackground;
            }
        }
    }
    static getBackGroundColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.BoardBackground;
            }
            case 'dark': {
                return DarkTheme.BoardBackground;
            }
            case 'uni': {
                return UniTheme.BoardBackground;
            }
            case 'fallGuys': {
                return FallGuysTheme.BoardBackground;
            }
            case 'minecraft': {
                return MinecraftTheme.BoardBackground;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.BoardBackground;
            }
            case 'halloween': {
                return HalloweenTheme.BoardBackground;
            }
            default: {
                // same has light
                return LightTheme.BoardBackground;
            }
        }
    }
    static getTextColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.Text;
            }
            case 'dark': {
                return DarkTheme.Text;
            }
            case 'uni': {
                return UniTheme.Text;
            }
            case 'fallGuys': {
                return FallGuysTheme.Text;
            }
            case 'minecraft': {
                return MinecraftTheme.Text;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.Text;
            }
            case 'halloween': {
                return HalloweenTheme.Text;
            }
            default: {
                // same has light
                return LightTheme.Text;
            }
        }
    }
    static getNormalSquareColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.NormalSquare;
            }
            case 'dark': {
                return DarkTheme.NormalSquare;
            }
            case 'uni': {
                return UniTheme.NormalSquare;
            }
            case 'fallGuys': {
                return FallGuysTheme.NormalSquare;
            }
            case 'minecraft': {
                return MinecraftTheme.NormalSquare;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.NormalSquare;
            }
            case 'halloween': {
                return HalloweenTheme.NormalSquare;
            }
            default: {
                // same has light
                return LightTheme.NormalSquare;
            }
        }
    }
    static getSpecialSquareColor(theme: string, square: SpecialCaseInfo): string {
        const color = ColorsManagerSpecialSquares.getColor(theme, square);
        if (color === '') return this.getNormalSquareColor(theme);
        return color;
    }
    static getEaselBorderColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.EaselBorder;
            }
            case 'dark': {
                return DarkTheme.EaselBorder;
            }
            case 'uni': {
                return UniTheme.EaselBorder;
            }
            case 'fallGuys': {
                return FallGuysTheme.EaselBorder;
            }
            case 'minecraft': {
                return MinecraftTheme.EaselBorder;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.EaselBorder;
            }
            case 'halloween': {
                return HalloweenTheme.EaselBorder;
            }
            default: {
                // same has light
                return LightTheme.EaselBorder;
            }
        }
    }
    // eslint-disable-next-line complexity
    static getLetterColor(theme: string, letter: Letter, isPlayerTurn: boolean): string {
        if (letter.state === LetterState.Placement && letter.isJoker) return this.getPlacedJokerColor(theme);
        if (!isPlayerTurn && letter.state === LetterState.Easel) {
            switch (theme) {
                case 'light': {
                    return LightTheme.LetterNotItsTurn;
                }
                case 'dark': {
                    return DarkTheme.LetterNotItsTurn;
                }
                case 'uni': {
                    return UniTheme.LetterNotItsTurn;
                }
                case 'fallGuys': {
                    return FallGuysTheme.LetterNotItsTurn;
                }
                case 'minecraft': {
                    return MinecraftTheme.LetterNotItsTurn;
                }
                case 'bubbleTea': {
                    return BubbleTeaTheme.LetterNotItsTurn;
                }
                case 'halloween': {
                    return HalloweenTheme.LetterNotItsTurn;
                }
                default: {
                    // same has light
                    return LightTheme.LetterNotItsTurn;
                }
            }
        } else {
            return this.getNormalLetterColor(theme);
        }
    }

    static getNormalLetterColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.Letter;
            }
            case 'dark': {
                return DarkTheme.Letter;
            }
            case 'uni': {
                return UniTheme.Letter;
            }
            case 'fallGuys': {
                return FallGuysTheme.Letter;
            }
            case 'minecraft': {
                return MinecraftTheme.Letter;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.Letter;
            }
            case 'halloween': {
                return HalloweenTheme.Letter;
            }
            default: {
                // same has light
                return LightTheme.Letter;
            }
        }
    }

    static getPlacedJokerColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.PlacedJoker;
            }
            case 'dark': {
                return DarkTheme.PlacedJoker;
            }
            case 'uni': {
                return UniTheme.PlacedJoker;
            }
            case 'fallGuys': {
                return FallGuysTheme.PlacedJoker;
            }
            case 'minecraft': {
                return MinecraftTheme.PlacedJoker;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.PlacedJoker;
            }
            case 'halloween': {
                return HalloweenTheme.PlacedJoker;
            }
            default: {
                // same has light
                return LightTheme.PlacedJoker;
            }
        }
    }
    static getLetterBoarderPlacedColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.LetterBoarderPlaced;
            }
            case 'dark': {
                return DarkTheme.LetterBoarderPlaced;
            }
            case 'uni': {
                return UniTheme.LetterBoarderPlaced;
            }
            case 'fallGuys': {
                return FallGuysTheme.LetterBoarderPlaced;
            }
            case 'minecraft': {
                return MinecraftTheme.LetterBoarderPlaced;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.LetterBoarderPlaced;
            }
            case 'halloween': {
                return HalloweenTheme.LetterBoarderPlaced;
            }
            default: {
                // same has light
                return LightTheme.LetterBoarderPlaced;
            }
        }
    }
    static getLetterBoarderExchangeColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.LetterBoarderexchange;
            }
            case 'dark': {
                return DarkTheme.LetterBoarderexchange;
            }
            case 'uni': {
                return UniTheme.LetterBoarderexchange;
            }
            case 'fallGuys': {
                return FallGuysTheme.LetterBoarderexchange;
            }
            case 'minecraft': {
                return MinecraftTheme.LetterBoarderexchange;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.LetterBoarderexchange;
            }
            case 'halloween': {
                return HalloweenTheme.LetterBoarderexchange;
            }
            default: {
                // same has light
                return LightTheme.LetterBoarderexchange;
            }
        }
    }
    static getPlacementCursorColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.PlacementCursor;
            }
            case 'dark': {
                return DarkTheme.PlacementCursor;
            }
            case 'uni': {
                return UniTheme.PlacementCursor;
            }
            case 'fallGuys': {
                return FallGuysTheme.PlacementCursor;
            }
            case 'minecraft': {
                return MinecraftTheme.PlacementCursor;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.PlacementCursor;
            }
            case 'halloween': {
                return HalloweenTheme.PlacementCursor;
            }
            default: {
                // same has light
                return LightTheme.PlacementCursor;
            }
        }
    }
    static getArrowCursorBackgroundColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.ArrowCursorBackground;
            }
            case 'dark': {
                return DarkTheme.ArrowCursorBackground;
            }
            case 'uni': {
                return UniTheme.ArrowCursorBackground;
            }
            case 'fallGuys': {
                return FallGuysTheme.ArrowCursorBackground;
            }
            case 'minecraft': {
                return MinecraftTheme.ArrowCursorBackground;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.ArrowCursorBackground;
            }
            case 'halloween': {
                return HalloweenTheme.ArrowCursorBackground;
            }
            default: {
                // same has light
                return LightTheme.ArrowCursorBackground;
            }
        }
    }
    static getArrowCursorBoarderColor(theme: string): string {
        switch (theme) {
            case 'light': {
                return LightTheme.ArrowCursorBorder;
            }
            case 'dark': {
                return DarkTheme.ArrowCursorBorder;
            }
            case 'uni': {
                return UniTheme.ArrowCursorBorder;
            }
            case 'fallGuys': {
                return FallGuysTheme.ArrowCursorBorder;
            }
            case 'minecraft': {
                return MinecraftTheme.ArrowCursorBorder;
            }
            case 'bubbleTea': {
                return BubbleTeaTheme.ArrowCursorBorder;
            }
            case 'halloween': {
                return HalloweenTheme.ArrowCursorBorder;
            }
            default: {
                // same has light
                return LightTheme.ArrowCursorBorder;
            }
        }
    }
}
