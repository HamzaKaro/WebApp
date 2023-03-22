/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Coordinate } from '@app/classes/board/coordinate';
import { Letter } from '@app/classes/board/letter';
import { Position } from '@app/classes/board/position';
import { Square } from '@app/classes/board/square';
import { Player } from '@app/classes/player';
import {
    CHAR_PROPORTION_IN_LETTER,
    DEFAULT_BOARD_LETTER_SIZE,
    DEFAULT_BOARD_TEXT_ALIGN,
    DEFAULT_BOARD_TEXT_BASELINE,
    DEFAULT_LETTER_PADDING,
    DEFAULT_LINE_THICKNESS,
    DEFAULT_SQUARE_TEXT_SIZE,
    VALUE_PROPORTION_IN_LETTER,
} from '@app/constants/board-constants';
import { GameService } from '@app/services/game-service';
import { ThemeService } from '@app/theme.service';
import { ColorsManager } from './colors-manager';

export class ObservedDrawGameArea {
    canvas: CanvasRenderingContext2D;
    easelPositions: Map<number, Position>;
    squareSize: number;
    halfSquareSize: number;
    lineThickness: number = DEFAULT_LINE_THICKNESS;
    letterPadding: number = DEFAULT_LETTER_PADDING;
    letterSize: number;
    halfLetterSize: number;
    canvasSize: { x: number; y: number };

    constructor(
        private themeService: ThemeService,
        private player: Player,
        private gameService: GameService,
        canvas: CanvasRenderingContext2D,
        squareSize: number,
        easelPositions: Map<number, Position>,
        canvasSize: { x: number; y: number },
    ) {
        this.canvas = canvas;
        this.easelPositions = easelPositions;
        this.squareSize = squareSize;
        this.letterSize = squareSize - DEFAULT_LINE_THICKNESS * 2;
        this.halfSquareSize = Math.floor(this.squareSize / 2);
        this.halfLetterSize = Math.floor((this.squareSize - DEFAULT_LINE_THICKNESS * 2) / 2);
        this.canvasSize = canvasSize;
    }

    paint(board: Square[][]) {
        this.paintBackground();
        // drawBoard
        for (const row of board) {
            for (const square of row) if (square !== undefined) this.paintSquare(square!);
        }
        // drawPlacedLetters
        for (const row of this.gameService.placedLetters.value) {
            for (const letter of row)
                if (letter !== undefined) {
                    if (letter.position === undefined) {
                        this.setPosition(letter, board);
                    }
                    this.paintLetter(letter!);
                }
        }
        if (!this.player.isItsTurn && this.gameService.placementCursor !== undefined) {
            this.paintPlacementCursor(board);
        }
    }

    paintPlacementCursor(board: Square[][]) {
        if (this.gameService.placementCursor.value !== undefined) {
            const position = this.getPositionInBoard(this.gameService.placementCursor.value!, board);

            this.canvas.beginPath();
            this.paintRect(position, this.letterSize, ColorsManager.getPlacementCursorColor(this.themeService.theme));
            this.canvas.beginPath();
            this.canvas.fillStyle = ColorsManager.getTextColor(this.themeService.theme);
            this.canvas.textAlign = 'center';
            this.canvas.textBaseline = 'middle';
            this.canvas.font = DEFAULT_BOARD_LETTER_SIZE + 'px system-ui';
            this.canvas.fillText(
                'placement',
                position.x + this.halfLetterSize,
                position.y + this.halfLetterSize / 2 + this.letterPadding,
                this.letterSize,
            );
            this.canvas.fillText(
                'ici!',
                position.x + this.halfLetterSize,
                position.y + (this.halfLetterSize * 3) / 2 - this.letterPadding,
                this.letterSize,
            );
        }
    }
    paintBackground() {
        this.canvas.fillStyle = ColorsManager.getBackGroundColor(this.themeService.theme);
        this.canvas.fillRect(0, 0, this.canvasSize.x, this.canvasSize.y);
    }

    paintSquare(square: Square) {
        this.paintRect(square.position, this.squareSize - this.lineThickness, square.color);
        this.drawBoardSquareText(square);
    }
    paintLetter(letter: Letter | undefined) {
        if (letter === undefined) return;
        this.paintRect(letter.position!, this.letterSize, ColorsManager.getLetterColor(this.themeService.theme, letter, false));
        this.drawLetterText(letter);
    }
    setPosition(letter: Letter, board: Square[][]) {
        const position = board[letter.coordinate!.x][letter.coordinate!.y].position;
        letter.position = new Position(position.x, position.y);
    }
    drawLetterText(letter: Letter) {
        const textColor = ColorsManager.getTextColor(this.themeService.theme);
        this.canvas.font = this.letterSize * CHAR_PROPORTION_IN_LETTER + 'px system-ui';
        this.canvas.fillStyle = textColor;
        this.canvas.textAlign = 'start';
        this.canvas.textBaseline = DEFAULT_BOARD_TEXT_BASELINE;
        this.canvas.fillText(
            letter.char.toUpperCase() as string,
            letter.position!.x + DEFAULT_LETTER_PADDING,
            letter.position!.y + this.halfLetterSize,
        );

        this.canvas.font = this.letterSize * VALUE_PROPORTION_IN_LETTER + 'px system-ui';
        this.canvas.fillStyle = textColor;
        this.canvas.textAlign = 'end';
        this.canvas.textBaseline = 'bottom';
        this.canvas.fillText(
            `${letter.value}`,
            letter.position!.x + this.letterSize - this.letterPadding,
            letter.position!.y + this.letterSize - this.letterPadding,
        );
        this.canvas.stroke();
    }

    paintRect(position: Position, size: number, color: string) {
        this.canvas.fillStyle = color;
        this.canvas.fillRect(position.x, position.y, size, size);
    }

    drawBoardSquareText(square: Square) {
        this.canvas.font = DEFAULT_SQUARE_TEXT_SIZE + 'px system-ui';
        this.canvas.fillStyle = square.textColor;
        this.canvas.textAlign = DEFAULT_BOARD_TEXT_ALIGN;
        this.canvas.textBaseline = DEFAULT_BOARD_TEXT_BASELINE;
        this.handleSpecialSquare(square);
        this.canvas.stroke();
    }

    getPositionInBoard(coordinate: Coordinate, board: Square[][]): Position {
        return new Position(
            board[coordinate.x][coordinate.y].position.x + DEFAULT_LINE_THICKNESS,
            board[coordinate.x][coordinate.y].position.y + DEFAULT_LINE_THICKNESS,
        );
    }

    private handleSpecialSquare(square: Square) {
        if (square.content.includes(' x')) {
            const multiplier = square.content.split('x');
            this.canvas.font = DEFAULT_SQUARE_TEXT_SIZE + 'px system-ui';
            this.canvas.fillText(multiplier[0] as string, square.position.x + this.halfSquareSize, square.position.y + this.squareSize / 3);
            this.canvas.fillText(
                '\n x' + multiplier[1],
                square.position.x + this.halfSquareSize,
                square.position.y + this.halfSquareSize + DEFAULT_BOARD_LETTER_SIZE,
            );
        } else
            this.canvas.fillText(
                square.content.toUpperCase() as string,
                square.position.x + this.halfSquareSize,
                square.position.y + this.halfSquareSize,
            );
    }
}
