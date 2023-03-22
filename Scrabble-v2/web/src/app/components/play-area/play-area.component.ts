import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawGameArea } from '@app/classes/board/draw-game-area';
import { GestureHandler } from '@app/classes/board/gesture-handler';
import { Position } from '@app/classes/board/position';
import { Square } from '@app/classes/board/square';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { DEFAULT_CASE_COUNT, DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/board-constants';
import { BoardGeneratorService } from '@app/services/board-generator.service';
import { GameService } from '@app/services/game-service';
import { ThemeService } from '@app/theme.service';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('boardCanvas', { static: false }) private boardCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridContainer', { static: false }) private gridContainer: ElementRef;

    private drawGameArea: DrawGameArea;
    private gestureHandler: GestureHandler;

    private easelPositions: Map<number, Position>;
    private board: Square[][];

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    private squareSize: number;

    constructor(
        private gameService: GameService,
        private player: Player,
        private themeService: ThemeService,
        private dialog: MatDialog,
        private room: Room,
    ) {
        this.squareSize = Math.floor(this.canvasSize.x / DEFAULT_CASE_COUNT);
        this.board = BoardGeneratorService.buildBoardArray(this.squareSize, this.themeService.theme);
        this.easelPositions = BoardGeneratorService.setEaselPositions(this.squareSize);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (!this.gameService.isConnectedPlayerTurn.value) return;
        this.gestureHandler.handleKeyDown(event);
        this.drawGameArea.paint(this.board);
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        if (!this.gameService.isConnectedPlayerTurn.value) return;
        this.gestureHandler.mouseDown(event);
        this.drawGameArea.paint(this.board);
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(event: MouseEvent) {
        if (!this.gameService.isConnectedPlayerTurn.value) return;
        this.gestureHandler.mouseMove(event);
        this.drawGameArea.paint(this.board);
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        if (!this.gameService.isConnectedPlayerTurn.value) return;
        this.gestureHandler.mouseUp(event);
        this.drawGameArea.paint(this.board);
    }
    @HostListener('mouseout')
    mouseOut() {
        if (!this.gameService.isConnectedPlayerTurn.value) return;
        this.gestureHandler.mouseOut();
        this.drawGameArea.paint(this.board);
    }
    ngAfterViewInit() {
        this.gridContainer.nativeElement.style.height = DEFAULT_HEIGHT + 'px';
        this.gridContainer.nativeElement.style.width = DEFAULT_WIDTH + 'px';

        this.drawGameArea = new DrawGameArea(
            this.themeService,
            this.player,
            this.gameService,
            this.boardCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D,
            this.squareSize,
            this.easelPositions,
            this.canvasSize,
        );
        this.gestureHandler = new GestureHandler(
            this.gameService,
            this.squareSize,
            this.easelPositions,
            this.drawGameArea.letterSize,
            this.canvasSize,
            this.board,
            this.dialog,
            this.room,
        );
        // TODO: (Marie) ajouter les subscribe ici!!!
        this.gameService.easel.subscribe(() => {
            this.drawGameArea.paint(this.board);
        });

        this.gameService.isConnectedPlayerTurn.subscribe(() => {
            this.gestureHandler.boardIsEmpty();
            this.gestureHandler.returnLettersToEasel();
            this.drawGameArea.paint(this.board);
        });
        this.gameService.placementCursor.subscribe(() => {
            this.drawGameArea.paint(this.board);
        });
        this.gameService.placedLetters.subscribe(() => {
            this.drawGameArea.paint(this.board);
        });

        this.gridContainer.nativeElement.focus();
    }

    get width(): number {
        return this.canvasSize.x;
    }
    get height(): number {
        return this.canvasSize.y;
    }
}
