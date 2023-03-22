import { ColorsManager } from '@app/classes/board/colors-manager';
import { Position } from '@app/classes/board/position';
import { Square } from '@app/classes/board/square';
import { DEFAULT_CASE_COUNT, specialCases } from '@app/constants/board-constants';
import { RACK_CAPACITY } from '@app/constants/rack-constants';
import { MultiplierType } from '@app/enums/multiplayer-type';

export class BoardGeneratorService {
    static setEaselPositions(squareSize: number): Map<number, Position> {
        const easelPositions: Map<number, Position> = new Map();
        for (let i = 0; i < RACK_CAPACITY; i++) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            easelPositions.set(i, new Position((5.5 + i) * squareSize, (DEFAULT_CASE_COUNT + 1) * squareSize));
        }
        return easelPositions;
    }
    static buildBoardArray(squareSize: number, theme: string) {
        const board: Square[][] = [];
        for (let i = 0; i < DEFAULT_CASE_COUNT; i++) {
            const row = new Array(DEFAULT_CASE_COUNT).fill(null);
            board.push(row);
        }
        const normalSquareColor = ColorsManager.getNormalSquareColor(theme);
        const textColor = ColorsManager.getTextColor(theme);
        for (let i = 0; i < DEFAULT_CASE_COUNT; i++) {
            for (let j = 0; j < DEFAULT_CASE_COUNT; j++) {
                board[i][j] = new Square(new Position(squareSize * i, squareSize * j), normalSquareColor, textColor, '', false);
            }
        }

        this.fillIndexSquares(board, theme);
        this.fillSpecialSquares(board, theme);

        return board;
    }

    static fillSpecialSquares(board: Square[][], theme: string) {
        for (const square of specialCases) {
            // TODO: change function to get color based on squareMultiplyerType
            board[square.position.x][square.position.y].color = ColorsManager.getSpecialSquareColor(theme, square);
            if (square.multiplierType === MultiplierType.LetterMultiplier) board[square.position.x][square.position.y].content = 'Lettre x';
            else board[square.position.x][square.position.y].content = 'Mot x';
            board[square.position.x][square.position.y].content += square.multiplierValue.toString();
            if (square.isStar) {
                board[square.position.x][square.position.y].content = '\u2605';
            }
        }
    }

    static fillIndexSquares(board: Square[][], theme: string) {
        const color = ColorsManager.getBackGroundColor(theme);
        const textColor = ColorsManager.getEaselBorderColor(theme);
        board[0][0].color = color;

        for (let i = 1; i < DEFAULT_CASE_COUNT; i++) {
            board[0][i].color = color;
            board[0][i].textColor = textColor;
            board[0][i].content = String.fromCharCode(i - 1 + 'A'.charCodeAt(0));

            board[i][0].color = color;
            board[i][0].textColor = textColor;
            board[i][0].content = i.toString();
        }
    }
}
