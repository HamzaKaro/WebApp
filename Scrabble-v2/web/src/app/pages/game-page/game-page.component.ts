import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { ConfirmationPopupComponent } from '@app/confirmation-popup/confirmation-popup.component';
import { RACK_CAPACITY } from '@app/constants/rack-constants';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { InvitationService } from '@app/invitation.service';
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
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    lettersBankCount: number = 0;
    isConnected: boolean = false;
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
        private invitationService: InvitationService,
    ) {}
    @HostListener('window:beforeunload') onBeforeUnload() {
        this.leaveGame();
        this.stopSocketlisteners();
        this.isConnected = false;
    }
    ngOnDestroy() {
        this.leaveGame();
        this.stopSocketlisteners();
        this.isConnected = false;
    }
    ngOnInit() {
        if (!this.isConnected) this.connect();
        this.isConnected = true;
        const session = this.sessionStorageService.getPlayerData('data');
        if (this.room.roomInfo.name === '') {
            this.socketService.send('reconnect', { socketId: session.socketId, roomName: session.roomName });
            return;
        }
        this.player.isObserver = false;
        this.gameService.initSocket();
        this.startGame();
        this.sessionStorageService.setItem('data', JSON.stringify({ socketId: this.socketService.socket.id, roomName: this.room.roomInfo.name }));
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
        this.socketService.send('command', '!aide');
    }

    hintCommand() {
        this.socketService.send('command', '!indice');
    }

    letterBankCommand() {
        this.socketService.send('command', '!réserve');
    }

    leaveGame() {
        this.socketService.send('giveUp');
        this.router.navigate(['/home']);
        this.gameService.reset();
        this.invitationService.isInRoom = false;
    }

    openTutorial() {
        this.dialog.open(TutorialComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
        });
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

    onExchange() {
        this.gameService.sendExchange();
    }

    onPlay() {
        this.gameService.sendPlay();
    }

    onSkip() {
        this.gameService.sendSkip();
    }

    get isGameOver(): boolean {
        return this.room.roomInfo.isGameOver as boolean;
    }

    isMyTurn(): boolean {
        if (!this.player) return false;
        return this.player.isItsTurn;
    }

    private connect() {
        // if (!this.socketService.isSocketAlive()) {
        //     this.socketService.connect();
        // }
        if (!this.socketServiceBot.isSocketAlive()) {
            this.socketServiceBot.connect();
        }
        this.configureBaseSocketFeatures();
        this.isConnected = true;
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
    }
    private stopSocketlisteners() {
        this.socketService.remove('updateRoom');
        this.socketService.remove('lettersBankCountUpdated');
        this.socketService.remove('reconnected');
        this.socketService.remove('drawBoard');
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
