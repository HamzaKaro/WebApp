import { Injectable } from '@angular/core';
import { ArrowCursor } from '@app/classes/board/arrow-cursor';
import { Coordinate } from '@app/classes/board/coordinate';
import { ExchangeStringService } from '@app/classes/board/exchange';
import { FetchBoard } from '@app/classes/board/fetch-board';
import { Letter } from '@app/classes/board/letter';
import { PlacementString } from '@app/classes/board/placement';
import { Player } from '@app/classes/player';
import { DEFAULT_CASE_COUNT } from '@app/constants/board-constants';
import { LetterState } from '@app/enums/letter-state';
import { BehaviorSubject } from 'rxjs';
import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    easel: BehaviorSubject<(Letter | undefined)[]> = new BehaviorSubject<(Letter | undefined)[]>([]);
    arrowCursor: BehaviorSubject<ArrowCursor | undefined>;
    placementCursor: BehaviorSubject<Coordinate | undefined> = new BehaviorSubject<Coordinate | undefined>(undefined);
    placedLetters: BehaviorSubject<(Letter | undefined)[][]> = new BehaviorSubject<(Letter | undefined)[][]>([]);
    isConnectedPlayerTurn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private socketClientService: SocketClientService, public player: Player) {
        for (let i = 0; i < DEFAULT_CASE_COUNT; i++) {
            const row = new Array(DEFAULT_CASE_COUNT).fill(undefined);
            this.placedLetters.value.push(row);
        }
        this.easel.next([
            { position: undefined, char: 'a', value: 1, state: LetterState.Easel, coordinate: undefined, isJoker: false } as Letter,
            { position: undefined, char: '*', value: 0, state: LetterState.Easel, coordinate: undefined, isJoker: true } as Letter,
            { position: undefined, char: 'c', value: 1, state: LetterState.Easel, coordinate: undefined, isJoker: false } as Letter,
            { position: undefined, char: 'd', value: 1, state: LetterState.Easel, coordinate: undefined, isJoker: false } as Letter,
            { position: undefined, char: 'e', value: 1, state: LetterState.Easel, coordinate: undefined, isJoker: false } as Letter,
            { position: undefined, char: 'z', value: 10, state: LetterState.Easel, coordinate: undefined, isJoker: false } as Letter,
            { position: undefined, char: 'k', value: 10, state: LetterState.Easel, coordinate: undefined, isJoker: false } as Letter,
        ]);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.arrowCursor = new BehaviorSubject<ArrowCursor | undefined>(undefined);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    }
    initSocket() {
        this.socketClientService.on('drawRack', (data: string) => {
            ExchangeStringService.updateEasel(this.easel.value, data.trim());
            this.easel.next(this.easel.value);
        });
        this.socketClientService.on('drawBoard', (data: unknown) => {
            PlacementString.updatePlacedLetters(this.placedLetters.value, data);
            this.placedLetters.next(this.placedLetters.value);
        });
        this.socketClientService.on('drawBoardCursor', (data: Coordinate) => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (data.x === -1) this.placementCursor.next(undefined);
            else this.placementCursor.next(new Coordinate(data.x, data.y));
        });
        this.socketClientService.on('fetchBoard', (data: string[]) => {
            FetchBoard.initializePlacedLetters(this.placedLetters.value, data);
            this.placedLetters.next(this.placedLetters.value);
        });

        this.socketClientService.on('playerTurnChanged', (data: string) => {
            this.isConnectedPlayerTurn.next(data === this.player.pseudo);
            this.arrowCursor.next(undefined);
            this.placementCursor.next(undefined);
        });
    }

    resetPlacedLetters() {
        this.placedLetters = new BehaviorSubject<(Letter | undefined)[][]>([]);
        for (let i = 0; i < DEFAULT_CASE_COUNT; i++) {
            const row = new Array(DEFAULT_CASE_COUNT).fill(undefined);
            this.placedLetters.value.push(row);
        }
        this.placedLetters.next(this.placedLetters.value);
    }

    reset() {
        this.resetPlacedLetters();
        this.placementCursor.next(undefined);
        this.arrowCursor.next(undefined);
        this.easel.next([]);
        this.isConnectedPlayerTurn.next(false);
    }

    sendPlacementCursor(room: string) {
        let data;
        if (this.placementCursor.value) {
            data = {
                roomName: room,
                x: this.placementCursor.value.x,
                y: this.placementCursor.value.y,
            };
        } else {
            data = {
                roomName: room,
                x: -1,
                y: -1,
            };
        }
        this.socketClientService.send('drawBoardCursor', data);
    }
    sendExchange() {
        this.socketClientService.send('command', ExchangeStringService.exchangeCommand(this.easel.value)); // ajouter d'envoyer le string
    }
    sendSkip() {
        this.socketClientService.send('command', '!passer');
    }
    sendPlay() {
        const placementCommand = PlacementString.placementCommand(this.easel.value, this.placedLetters.value);
        this.socketClientService.send('command', placementCommand);
    }
}
