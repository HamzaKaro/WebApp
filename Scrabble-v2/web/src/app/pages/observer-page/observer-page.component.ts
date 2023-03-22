import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { ConfirmationPopupComponent } from '@app/confirmation-popup/confirmation-popup.component';
import { RACK_CAPACITY } from '@app/constants/rack-constants';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { GameService } from '@app/services/game-service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientBotService } from '@app/services/socket-client-bot.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { SoundService } from '@app/services/sound.service';
import { TutorialComponent } from '@app/tutorial/tutorial.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-observer-page',
    templateUrl: './observer-page.component.html',
    styleUrls: ['./observer-page.component.scss'],
})
export class ObserverPageComponent implements OnInit, OnDestroy {
    lettersBankCount: number = 0;
    isConnected: boolean;
    constructor(
        private translate: TranslateService,
        private socketService: SocketClientService,
        private socketServiceBot: SocketClientBotService,
        private sessionStorageService: SessionStorageService,
        private focusHandlerService: FocusHandlerService,
        private router: Router,
        private dialog: MatDialog,
        public room: Room,
        public player: Player,
        private soundService: SoundService,
        private gameService: GameService,
    ) {
        this.isConnected = false;
    }

    ngOnInit() {
        if (this.isConnected) return;
        this.connect();
        this.isConnected = true;
        const session = this.sessionStorageService.getPlayerData('data');
        if (this.room.roomInfo.name === '') {
            this.socketService.send('reconnect', { socketId: session.socketId, roomName: session.roomName });
            return;
        }
        // this.startGame();
        this.socketService.send('fetchBoard', this.room.roomInfo.name);
        this.player.isObserver = true;
        this.gameService.initSocket();
        this.sessionStorageService.setItem('data', JSON.stringify({ socketId: this.socketService.socket.id, roomName: this.room.roomInfo.name }));
    }

    ngOnDestroy() {
        this.isConnected = false;
        this.stopSocketlisteners();
    }
    openTutorial() {
        this.dialog.open(TutorialComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
        });
    }

    updateFocus(event: MouseEvent) {
        event.stopPropagation();
        this.focusHandlerService.currentFocus.next(CurrentFocus.NONE);
    }

    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    startGame() {
        this.socketService.send('startGame');
    }

    helpCommand() {
        this.socketService.send('message', '!aide');
    }

    hintCommand() {
        this.socketService.send('message', '!indice');
    }

    letterBankCommand() {
        this.socketService.send('message', '!réserve');
    }

    leaveGame() {
        this.socketService.send('giveUp');
        this.router.navigate(['/home']);
        this.gameService.reset();
    }

    confirmLeaving() {
        const description: InformationalPopupData = {
            header: this.translate.instant('confirmation_popup.give_up.header'),
            body: this.translate.instant('confirmation_popup.give_up.body'),
        };
        const dialog = this.dialog.open(ConfirmationPopupComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: description,
        });

        dialog.afterClosed().subscribe((result) => {
            if (!result) return;
            this.leaveGame();
        });
    }
    goBackToHome() {
        this.router.navigate(['/home']);
    }

    get isGameOver(): boolean {
        return this.room.roomInfo.isGameOver as boolean;
    }

    private stopSocketlisteners() {
        this.socketService.remove('reconnected');
        this.socketService.remove('lettersBankCountUpdated');
        this.socketService.remove('updateRoom');
        this.socketService.remove('replaceBot');
        this.socketService.remove('drawBoard');
    }

    private connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        if (!this.socketServiceBot.isSocketAlive()) {
            this.socketServiceBot.connect();
        }
        this.configureBaseSocketFeatures();
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('reconnected', (data: { room: Room; player: Player }) => {
            this.setRoom(data.room);
            this.setPlayer(data.player);
            this.sessionStorageService.setItem('data', JSON.stringify({ socketId: data.player.socketId, roomName: data.room.roomInfo.name }));
        });
        this.socketService.on('lettersBankCountUpdated', (lettersBankCount: number) => {
            this.lettersBankCount = lettersBankCount;
            if (lettersBankCount < RACK_CAPACITY) {
                this.room.isBankUsable = false;
            }
        });
        this.socketService.on('updateRoom', (room: Room) => {
            this.setRoom(room);
        });

        this.socketService.on('replaceBot', () => {
            this.router.navigate(['/game']);
        });
    }

    private setRoom(roomServer: Room) {
        this.room.roomInfo.name = roomServer.roomInfo.name;
        this.room.roomInfo.timerPerTurn = roomServer.roomInfo.timerPerTurn;
        this.room.roomInfo.dictionary = roomServer.roomInfo.dictionary;
        this.room.roomInfo.gameType = roomServer.roomInfo.gameType;
        this.room.roomInfo.maxPlayers = roomServer.roomInfo.maxPlayers;
        this.room.players = roomServer.players;
        this.room.elapsedTime = roomServer.elapsedTime;
    }

    private setPlayer(player: Player) {
        this.player.pseudo = player.pseudo;
        this.player.socketId = player.socketId;
        this.player.points = player.points;
        this.player.isCreator = player.isCreator;
        this.player.isItsTurn = player.isItsTurn;
    }
}
