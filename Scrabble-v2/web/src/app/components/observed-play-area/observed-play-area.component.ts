/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ObservedDrawGameArea } from '@app/classes/board/observed-draw-game-area';
import { Position } from '@app/classes/board/position';
import { Square } from '@app/classes/board/square';
import { Player } from '@app/classes/player';
import { DEFAULT_CASE_COUNT, DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/board-constants';
import { BoardGeneratorService } from '@app/services/board-generator.service';
import { GameService } from '@app/services/game-service';
import { ThemeService } from '@app/theme.service';

@Component({
    selector: 'app-observed-play-area',
    templateUrl: './observed-play-area.component.html',
    styleUrls: ['./observed-play-area.component.scss'],
})
export class ObservedPlayAreaComponent implements AfterViewInit {
    @ViewChild('boardCanvas', { static: false }) private boardCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridContainer', { static: false }) private gridContainer: ElementRef;

    private drawGameArea: ObservedDrawGameArea;

    private easelPositions: Map<number, Position>;
    private board: Square[][];

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    private squareSize: number;

    constructor(private gameService: GameService, private player: Player, private themeService: ThemeService) {
        this.squareSize = Math.floor(this.canvasSize.x / DEFAULT_CASE_COUNT);
        this.board = BoardGeneratorService.buildBoardArray(this.squareSize, this.themeService.theme);
        this.easelPositions = BoardGeneratorService.setEaselPositions(this.squareSize);
    }

    ngAfterViewInit() {
        this.gridContainer.nativeElement.style.height = DEFAULT_HEIGHT + 'px';
        this.gridContainer.nativeElement.style.width = DEFAULT_WIDTH + 'px';

        this.drawGameArea = new ObservedDrawGameArea(
            this.themeService,
            this.player,
            this.gameService,
            this.boardCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D,
            this.squareSize,
            this.easelPositions,
            this.canvasSize,
        );
        this.gameService.easel.subscribe(() => {
            this.drawGameArea.paint(this.board);
        });

        this.gameService.isConnectedPlayerTurn.subscribe(() => {
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
