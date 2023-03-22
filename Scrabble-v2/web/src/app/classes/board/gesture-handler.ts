/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { MatDialog } from '@angular/material/dialog';
import { Coordinate } from '@app/classes/board/coordinate';
import { Letter } from '@app/classes/board/letter';
import { Position } from '@app/classes/board/position';
import { Square } from '@app/classes/board/square';
import { Room } from '@app/classes/room';
import { DEFAULT_CASE_COUNT, DEFAULT_LINE_THICKNESS, NUMBER_OF_TILES_IN_EASEL, TOLERATED_DISTANCE_DOWN_UP } from '@app/constants/board-constants';
import { LetterState } from '@app/enums/letter-state';
import { JokerPopupComponent } from '@app/joker-popup/joker-popup.component';
import { GameService } from '@app/services/game-service';
import { ArrowCursor } from './arrow-cursor';

export class GestureHandler {
    easelPositions: Map<number, Position>;
    letterSize: number;
    squareSize: number;
    isDragging: boolean = false;
    targetId: number;
    startX: number;
    startY: number;
    canvasSize: { x: number; y: number };
    board: Square[][];
    lastX: number;
    lastY: number;
    isPlacementByDrag: boolean = false;
    isPlacementByKeyboard: boolean = false;
    lettersInPlacementOrder: Map<number, number>;
    counter: number;
    cursorIndex: number | undefined;
    constructor(
        private gameService: GameService,
        squareSize: number,
        easelPositions: Map<number, Position>,
        letterSize: number,
        canvasSize: { x: number; y: number },
        board: Square[][],
        private dialog: MatDialog,
        private room: Room,
    ) {
        this.lettersInPlacementOrder = new Map();
        for (let index = 0; index < NUMBER_OF_TILES_IN_EASEL; index++) {
            this.lettersInPlacementOrder.set(index, 0);
        }
        this.cursorIndex = NUMBER_OF_TILES_IN_EASEL;
        this.easelPositions = easelPositions;
        this.letterSize = letterSize;
        this.canvasSize = canvasSize;
        this.board = board;
        this.squareSize = squareSize;
        this.counter = 1;
    }
    resetLettersInPlacementOrder() {
        this.lettersInPlacementOrder.forEach((key) => this.lettersInPlacementOrder.set(key, 0));
        this.counter = 1;
        this.cursorIndex = NUMBER_OF_TILES_IN_EASEL;
    }
    isInBoard(x: number, y: number): boolean {
        if (x < this.squareSize || y < this.squareSize || y > this.squareSize * DEFAULT_CASE_COUNT || x > this.squareSize * DEFAULT_CASE_COUNT) {
            return false;
        }
        return true;
    }
    isInLetter(letter: Letter | undefined, dx: number, dy: number): boolean {
        if (letter === undefined) {
            return false;
        }
        if (letter.position === undefined) {
            return false;
        }
        const letterTop = letter.position.y;
        const letterBottom = letter.position.y + this.letterSize;
        const letterRight = letter.position.x + this.letterSize;
        const letterLeft = letter.position.x;
        if (dx >= letterLeft && dx <= letterRight && dy >= letterTop && dy <= letterBottom) {
            return true;
        }
        return false;
    }
    isInArrowCursor(): boolean {
        if (!this.gameService.arrowCursor.value) return false;
        const arrowCursorPosition: Position =
            this.board[this.gameService.arrowCursor.value!.coordinate.x][this.gameService.arrowCursor.value!.coordinate.y].position;
        const top = arrowCursorPosition.y;
        const bottom = arrowCursorPosition.y + this.letterSize;
        const left = arrowCursorPosition.x;
        const right = arrowCursorPosition.x + this.letterSize;
        if (this.lastX >= left && this.lastX <= right && this.lastY >= top && this.lastY <= bottom) return true;
        return false;
    }
    isInLetterAreaInEasel(): boolean {
        const position = this.easelPositions.get(this.targetId)!;
        const top = position.y;
        const bottom = position.y + this.letterSize;
        const left = position.x;
        const right = position.x + this.letterSize;
        if (this.lastX >= left && this.lastX <= right && this.lastY >= top && this.lastY <= bottom) return true;
        return false;
    }
    isDistanceBetweenDownAndUpSmall(event: MouseEvent): boolean {
        const distance = Math.sqrt(Math.pow(event.offsetX - this.startX, 2) + Math.pow(event.offsetY - this.startY, 2));
        if (distance < TOLERATED_DISTANCE_DOWN_UP) return true;
        return false;
    }
    isSquareAvailable(coordinate: Coordinate): boolean {
        if (this.gameService.placedLetters.value[coordinate.x][coordinate.y] !== undefined) {
            return false;
        }
        return true;
    }
    isInGameArea(x: number, y: number): boolean {
        if (x < 0 || y < 0 || x > this.canvasSize.x || y > this.canvasSize.y) {
            return false;
        }
        return true;
    }
    isThereALetterOfPlaced(): boolean {
        if (this.gameService.easel.value.find((letter) => letter?.state === LetterState.Placement)) return true;
        return false;
    }
    handleClickInLetter() {
        if (this.gameService.easel.value[this.targetId]?.isJoker === true && this.isInBoard(this.lastX, this.lastY) && this.isPlacementByDrag) {
            this.callJoker();
        }
        if (this.gameService.easel.value[this.targetId]?.state === LetterState.Easel) {
            if (this.gameService.easel.value[this.targetId]) {
                this.gameService.easel.value[this.targetId]!.state = LetterState.Exchange;
                this.setTilePositionInEasel(this.targetId);
                this.gameService.easel.next(this.gameService.easel.value);
            }
        } else if (this.gameService.easel.value[this.targetId]?.state === LetterState.Exchange) {
            if (this.gameService.easel.value[this.targetId]) {
                this.gameService.easel.value[this.targetId]!.state = LetterState.Easel;
                this.setTilePositionInEasel(this.targetId);
                this.gameService.easel.next(this.gameService.easel.value);
            }
        }
    }
    setTilePositionInEasel(index: number) {
        this.gameService.easel.value[index!]!.position!.move(this.easelPositions.get(index)!);
    }
    returnLettersToEasel() {
        this.gameService.easel.value.forEach((value, index) => this.returnLetterToEasel(index));
    }
    returnLetterToEasel(index: number) {
        if (this.gameService.easel.value[index]?.isJoker === true) {
            this.gameService.easel.value[index]!.char = '*';
        }
        this.setTilePositionInEasel(index);
        if (this.gameService.easel.value[index]) {
            this.gameService.easel.value[index]!.state = LetterState.Easel;
        }
    }
    async openJoker() {
        const dialog = this.dialog.open(JokerPopupComponent, {
            width: '300px',
            autoFocus: true,
            data: this.targetId,
            disableClose: true,
        });
        dialog.afterClosed().subscribe((data) => {
            if (data === '' || data === undefined) this.returnLetterToEasel(data.targetId);
            this.gameService.easel.value[data.targetId]!.char = data.joker;
            this.gameService.easel.next(this.gameService.easel.value);
        });
    }
    updateTilesPlacementOrder(index: number) {
        if (this.gameService.easel.value[index]?.state === LetterState.Placement) {
            this.lettersInPlacementOrder.set(index, this.counter);
            this.counter++;
        }
        if (this.gameService.easel.value[index]?.state === LetterState.Easel) {
            this.lettersInPlacementOrder.set(index, 0);
        }
        if (index === this.cursorIndex || this.cursorIndex === NUMBER_OF_TILES_IN_EASEL || this.gameService.placementCursor.value === undefined) {
            const tiInPl: Map<number, number> = new Map([...this.lettersInPlacementOrder.entries()].sort((e1, e2) => e1[1] - e2[1]));
            this.cursorIndex = Array.from(tiInPl).find(
                ([key, value]) => value !== 0 && this.gameService.easel.value[key]?.state === LetterState.Placement,
            )?.[0];
            if (this.cursorIndex !== undefined) {
                this.gameService.placementCursor.next(
                    new Coordinate(
                        this.gameService.easel.value[this.cursorIndex]!.coordinate!.x,
                        this.gameService.easel.value[this.cursorIndex]!.coordinate!.y,
                    ),
                );
                this.gameService.sendPlacementCursor(this.room.roomInfo.name);
            } else {
                this.gameService.placementCursor.next(undefined);
                this.gameService.sendPlacementCursor(this.room.roomInfo.name);
                this.cursorIndex = NUMBER_OF_TILES_IN_EASEL;
            }
        }
    }
    setLetterPositionInBoard(offsetX: number, offsetY: number): boolean {
        if (!this.isInBoard(offsetX, offsetY)) {
            this.returnLetterToEasel(this.targetId);
            return false;
        } else {
            const coordinate = this.computeCoordinate(offsetX, offsetY);
            if (this.targetId !== -1 && this.isSquareAvailable(coordinate)) {
                this.placeLetter(this.targetId, coordinate);
                this.gameService.easel.value.forEach((value, index) => {
                    if (value !== undefined) {
                        if (value.coordinate?.isEqual(coordinate) && index !== this.targetId) {
                            this.returnLetterToEasel(index);
                        }
                    }
                });
                return true;
            } else {
                this.returnLetterToEasel(this.targetId);
                return false;
            }
        }
    }
    placeLetter(index: number, coordinate: Coordinate) {
        const positionBoard = this.getPositionInBoard(coordinate);
        const position = new Position(positionBoard.x, positionBoard.y);
        position.add(DEFAULT_LINE_THICKNESS, DEFAULT_LINE_THICKNESS);
        if (this.gameService.easel.value[index]) {
            this.gameService.easel.value[index]!.position = position;
            this.gameService.easel.value[index]!.coordinate = new Coordinate(coordinate.x, coordinate.y);
            this.gameService.easel.value[index]!.state = LetterState.Placement;
        }
    }
    getPositionInBoard(coordinate: Coordinate): Position {
        return this.board[coordinate.x][coordinate.y].position;
    }
    computeCoordinate(x: number, y: number): Coordinate {
        return new Coordinate(Math.floor(x / this.squareSize), Math.floor(y / this.squareSize));
    }
    findInEasel(key: string): number {
        return this.gameService.easel.value.findIndex(
            (letter) => letter?.char === key && (letter?.state === LetterState.Easel || letter?.state === LetterState.Exchange),
        );
    }
    boardIsEmpty() {
        this.resetLettersInPlacementOrder();
        this.gameService.arrowCursor.next(undefined);
        this.gameService.placementCursor.next(undefined);
        this.isPlacementByDrag = false;
        this.isPlacementByKeyboard = false;
    }
    // Keyboard Possible Calls
    handleBackspace() {
        if (this.gameService.arrowCursor.value === undefined) return;
        this.gameService.arrowCursor.value.coordinate.before(this.gameService.arrowCursor.value.isHorizontal, this.gameService.placedLetters.value);
        const index = this.gameService.easel.value.findIndex((letter) => letter?.coordinate?.isEqual(this.gameService.arrowCursor.value!.coordinate));
        if (index !== -1) {
            this.returnLetterToEasel(index);
        } else {
            this.boardIsEmpty();
            this.gameService.sendPlacementCursor(this.room.roomInfo.name);
            this.isPlacementByKeyboard = false;
        }
    }
    handleEscape() {
        this.returnLettersToEasel();
        this.boardIsEmpty();
        this.gameService.sendPlacementCursor(this.room.roomInfo.name);
    }
    handleEnter() {
        this.gameService.sendPlay();
        this.isPlacementByKeyboard = false;
    }

    handleLetter(key: string) {
        if (!this.gameService.arrowCursor.value) return;
        if (!this.gameService.arrowCursor.value.coordinate.isValid()) return;
        key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (!RegExp('^[a-zA-Z]$').test(key)) return;
        let index = this.findInEasel(key);
        if (index !== -1) {
            this.placeLetter(
                index,
                new Coordinate(this.gameService.arrowCursor.value!.coordinate.x, this.gameService.arrowCursor.value!.coordinate.y),
            );
            this.updateTilesPlacementOrder(index);
            const coordinate = this.gameService.arrowCursor.value.coordinate;
            const isHorizontal = this.gameService.arrowCursor.value.isHorizontal;
            coordinate.after(isHorizontal, this.gameService.placedLetters.value);
            this.gameService.arrowCursor.next(this.gameService.arrowCursor.value);
        } else if (RegExp('^[A-Z]$').test(key)) {
            index = this.findInEasel('*');
            if (index !== -1) {
                this.placeLetter(
                    index,
                    new Coordinate(this.gameService.arrowCursor.value!.coordinate.x, this.gameService.arrowCursor.value!.coordinate.y),
                );
                if (this.gameService.easel.value[index]) {
                    this.gameService.easel.value[index]!.char = key;
                    this.updateTilesPlacementOrder(index);
                    const coordinate = this.gameService.arrowCursor.value.coordinate;
                    coordinate.after(this.gameService.arrowCursor.value.isHorizontal, this.gameService.placedLetters.value);
                    this.gameService.arrowCursor.next(this.gameService.arrowCursor.value);
                }
            }
        }
    }
    /// / functions for gestures
    mouseOut() {
        if (this.isDragging && !this.isPlacementByKeyboard) {
            this.returnLetterToEasel(this.targetId);
            this.updateTilesPlacementOrder(this.targetId);
            this.isDragging = false;
            this.targetId = -1;
            if (!this.isThereALetterOfPlaced()) this.boardIsEmpty();
        }
    }
    mouseMove(event: MouseEvent) {
        if (!this.isDragging) {
            return;
        }
        if (this.isPlacementByKeyboard) return;
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        const dx = mouseX - this.lastX;
        const dy = mouseY - this.lastY;
        if (this.targetId !== -1) {
            if (!this.isInGameArea(mouseX, mouseY)) {
                this.returnLetterToEasel(this.targetId);
                this.updateTilesPlacementOrder(this.targetId);
                this.targetId = -1;
            } else {
                this.gameService.easel.value[this.targetId]!.position?.add(dx, dy);
                if (this.isInBoard(mouseX, mouseY)) {
                    this.gameService.easel.value[this.targetId]!.state = LetterState.Placement;
                }
                this.lastX = mouseX;
                this.lastY = mouseY;
            }
        }
    }
    mouseDown(event: MouseEvent) {
        this.startX = event.offsetX;
        this.startY = event.offsetY;
        this.lastX = this.startX;
        this.lastY = this.startY;

        for (let index = 0; index < this.gameService.easel.value.length; index++) {
            if (this.isInLetter(this.gameService.easel.value[index], this.startX, this.startY)) {
                this.targetId = index;
                this.isDragging = true;
                index = this.gameService.easel.value.length;
            }
        }
    }

    async callJoker() {
        await this.openJoker();
        if (this.gameService.easel.value[this.targetId]?.char === '*' || !this.gameService.isConnectedPlayerTurn) {
            this.returnLetterToEasel(this.targetId);
        }
    }
    // eslint-disable-next-line complexity
    mouseUp(event: MouseEvent) {
        // isDragging true => click first happened in a letter
        if (this.isDragging) {
            if (this.isDistanceBetweenDownAndUpSmall(event)) {
                this.handleClickInLetter(); // TODO: GÉRER ne pas accepter changer joker par click si keyboard
            } else if (!this.isPlacementByKeyboard && this.setLetterPositionInBoard(event.offsetX, event.offsetY)) {
                // setLetter => placing in board and square was empty
                this.isPlacementByDrag = true;
                if (
                    this.gameService.easel.value[this.targetId]!.isJoker === true &&
                    this.gameService.easel.value[this.targetId]!.char === '*' &&
                    this.gameService.easel.value[this.targetId]!.state === LetterState.Placement
                ) {
                    this.callJoker();
                }
                this.updateTilesPlacementOrder(this.targetId);
            } else if (!this.isPlacementByKeyboard) {
                this.returnLetterToEasel(this.targetId);
                this.updateTilesPlacementOrder(this.targetId);
                if (!this.isThereALetterOfPlaced()) {
                    this.boardIsEmpty();
                }
            }
            this.isDragging = false;
            this.targetId = -1;
        } else {
            if (this.isPlacementByDrag) {
                return;
            }
            // clicking somewhere in board! gesture for => cursor
            if (this.isDistanceBetweenDownAndUpSmall(event) && this.isInBoard(event.offsetX, event.offsetY) && !this.isThereALetterOfPlaced()) {
                // TODO: consider click sur le plateau donc placement clavier, attention à être dans le plateau
                // ds le curseur rotate => cursor
                if (this.isInArrowCursor()) {
                    this.gameService.arrowCursor.value!.isHorizontal = !this.gameService.arrowCursor.value!.isHorizontal;
                    this.gameService.arrowCursor.next(this.gameService.arrowCursor.value);
                } else {
                    // ds un carré dispo   place =>cursor
                    const coordinate: Coordinate = this.computeCoordinate(event.offsetX, event.offsetY);
                    if (this.isSquareAvailable(coordinate)) {
                        if (this.gameService.arrowCursor.value) {
                            this.gameService.arrowCursor.value!.coordinate.move(coordinate);
                            this.gameService.arrowCursor.value.isHorizontal = true;
                            this.gameService.arrowCursor.next(this.gameService.arrowCursor.value);
                        } else {
                            this.gameService.arrowCursor.next(new ArrowCursor(coordinate, true));
                        }
                        this.isPlacementByKeyboard = true;
                    }
                }
            }
        }
    }
    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.handleEnter();
        }
        if (event.key === 'Escape') {
            this.handleEscape();
        }
        if (event.key === 'Backspace') {
            if (this.isPlacementByDrag) return;
            this.handleBackspace();
        } else this.handleLetter(event.key);
    }
}
