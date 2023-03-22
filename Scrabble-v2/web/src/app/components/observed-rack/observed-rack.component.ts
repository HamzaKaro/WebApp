import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CurrentFocus } from '@app/classes/current-focus';
import { Room } from '@app/classes/room';
import { MAX_RECONNECTION_DELAY, ONE_SECOND_IN_MS } from '@app/constants/constants';
import { DEFAULT_RACK_HEIGHT, DEFAULT_RACK_WIDTH, POINTS } from '@app/constants/rack-constants';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-observed-rack',
    templateUrl: './observed-rack.component.html',
    styleUrls: ['./observed-rack.component.scss'],
})
export class ObservedRackComponent implements OnInit {
    @Input()
    rackIndex: number;
    @ViewChild('rackCanvas', { static: false })
    private rackCanvas!: ElementRef<HTMLCanvasElement>;

    private canvasSize = { x: DEFAULT_RACK_WIDTH, y: DEFAULT_RACK_HEIGHT };
    constructor(private focusHandlerService: FocusHandlerService, private socketService: SocketClientService, readonly room: Room) {
        return;
    }

    ngOnInit() {
        this.connect();
        this.focusHandlerService.currentFocus.subscribe(() => {
            if (this.focusHandlerService.isCurrentFocus(CurrentFocus.RACK)) {
                this.rackCanvas.nativeElement.contentEditable = 'true';
                this.rackCanvas.nativeElement.focus();
                return;
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.room.racks = [
            ['a', 'a', 'a', 'a', 'a', 'a', 'a'],
            ['b', 'b', 'b', 'b', 'b', 'b', 'b'],
        ];
    }

    updateFocus(event: MouseEvent) {
        event.stopPropagation();
        if (this.room.roomInfo.isGameOver) {
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            return;
        }
        this.focusHandlerService.currentFocus.next(CurrentFocus.RACK);
    }

    getScore(letter: string): number {
        if (letter === '*') return 0;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const letterIndex = letter.charCodeAt(0) - 97;
        return POINTS[letterIndex];
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    private connect() {
        if (this.socketService.isSocketAlive()) {
            this.configureBaseSocketFeatures();
        }
        this.tryReconnection();
    }

    private tryReconnection() {
        let secondPassed = 0;

        const timerInterval = setInterval(() => {
            if (secondPassed >= MAX_RECONNECTION_DELAY) {
                clearInterval(timerInterval);
            }
            if (this.socketService.isSocketAlive()) {
                this.configureBaseSocketFeatures();
                this.socketService.send('getRackInfos', this.room.roomInfo.name);
                clearInterval(timerInterval);
            }
            secondPassed++;
        }, ONE_SECOND_IN_MS);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('drawRacks', (letters: string[][]) => {
            this.room.racks = [];
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let j = 0; j < this.room.players.length; j++) {
                this.room.racks.push(letters[j]);
            }
        });
    }
}
