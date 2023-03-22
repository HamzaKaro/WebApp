import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CurrentFocus } from '@app/classes/current-focus';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { BASE_TEN, MAX_RECONNECTION_DELAY, MINUTE_IN_SECOND, ONE_SECOND_IN_MS } from '@app/constants/constants';
import { EndGamePopupComponent } from '@app/endgame-popup/endgame-popup.component';
import { HttpService } from '@app/http.service';
import { Bot } from '@app/interfaces/bot';
import { InformationalPopupData } from '@app/interfaces/informational-popup-data';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { SessionStorageService } from '@app/services/session-storage.service';
import { SocketClientBotService } from '@app/services/socket-client-bot.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { TranslateService } from '@ngx-translate/core';

// eslint-disable-next-line no-unused-vars
@Component({
    selector: 'app-players-infos',
    templateUrl: './players-infos.component.html',
    styleUrls: ['./players-infos.component.scss'],
})
export class PlayersInfosComponent implements OnInit, OnDestroy {
    remainingTime: number;
    currentPlayerTurnPseudo: string;
    winnerPseudo: string;
    numberOfWinner: number;
    isConnected: boolean;
    bot: Player;
    bots: Bot[];
    constructor(
        private translate: TranslateService,
        private socketService: SocketClientService,
        private socketClientBotService: SocketClientBotService,
        private sessionStorageService: SessionStorageService,
        private focusHandlerService: FocusHandlerService,
        private httpService: HttpService,
        private dialog: MatDialog,
        public room: Room,
        public player: Player,
    ) {
        this.isConnected = false;
        this.room.roomInfo.isGameOver = false;
        if (this.room.players.length >= 2) this.bot = this.room.players[1];
    }

    get min(): number {
        return parseInt(`${this.remainingTime / MINUTE_IN_SECOND}`, BASE_TEN);
    }

    get sec(): number {
        return parseInt(`${this.remainingTime % MINUTE_IN_SECOND}`, BASE_TEN);
    }

    get isGameOver(): boolean {
        return this.room.roomInfo.isGameOver as boolean;
    }
    get beginners(): Bot[] {
        return this.bots.filter((e) => e.gameType === 'débutant');
    }

    get experts(): Bot[] {
        return this.bots.filter((e) => e.gameType === 'expert');
    }

    get dictionary(): string {
        if (!this.room) return '';
        return this.room.roomInfo.dictionary;
    }

    ngOnInit() {
        if (this.isConnected) return;
        this.connect();
        this.remainingTime = 0;
        this.isConnected = true;
        this.handleRefresh();
    }

    ngOnDestroy() {
        this.stopSocketlisteners();
    }

    async handleRefresh() {
        const updateBots = await this.httpService.getAllBots().toPromise();
        if (this.httpService.anErrorOccurred()) {
            this.bots = [];
            return;
        }
        this.bots = updateBots;
    }

    getPlayer(pseudo: string): Player | undefined {
        const player = this.room.players.find((element) => element.pseudo === pseudo);
        return player;
    }

    getPlayerInfo(isClient: boolean, info: string): string | number {
        const wantedPlayer = isClient
            ? this.room.players.find((player) => player.pseudo === this.player.pseudo)
            : this.room.players.find((player) => player.pseudo !== this.player.pseudo);

        let infoToReturn: string | number = '';
        switch (info) {
            case 'pseudo':
                infoToReturn = wantedPlayer ? wantedPlayer.pseudo : '';
                break;
            case 'score':
                infoToReturn = wantedPlayer ? wantedPlayer.points : 0;
                break;
        }
        return infoToReturn;
    }
    showEndGameDialog(winners: Player[]) {
        const pseudos: string[] = [];
        winners.forEach((player) => {
            pseudos.push(player.pseudo);
        });
        const description: InformationalPopupData = {
            header: this.translate.instant('end_game.title'),
            body: this.translate.instant('end_game.winners') + pseudos.join(', '),
        };
        this.dialog.open(EndGamePopupComponent, {
            width: '650px',
            autoFocus: true,
            data: description,
        });
    }
    replaceBot(player: Player) {
        this.socketService.send('replaceBot', { roomName: this.room.roomInfo.name, observer: this.player, bot: player });
    }
    private stopSocketlisteners() {
        this.socketService.remove('playerTurnChanged');
        this.socketService.remove('timeUpdated');
        this.socketService.remove('playerLeft');
        this.socketService.remove('gameIsOver');
        this.socketService.remove('updatePlayerScore');
        this.socketService.remove('convertToRoomSoloBotStatus');
        this.socketService.remove('botInfos');
    }

    private connect() {
        if (this.socketService.isSocketAlive() && this.socketClientBotService.isSocketAlive()) {
            this.configureBaseSocketFeatures();
            return;
        }
        this.tryReconnection();
    }

    private tryReconnection() {
        let secondPassed = 0;

        const timerInterval = setInterval(() => {
            if (secondPassed >= MAX_RECONNECTION_DELAY) {
                clearInterval(timerInterval);
            }
            if (this.socketService.isSocketAlive() && this.socketClientBotService.isSocketAlive()) {
                this.configureBaseSocketFeatures();
                this.socketService.send('getPlayerInfos', this.room.roomInfo.name);
                clearInterval(timerInterval);
            }
            secondPassed++;
        }, ONE_SECOND_IN_MS);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('playerTurnChanged', (currentPlayerTurnPseudo: string) => {
            if (this.player.isItsTurn) {
                this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            }
            this.currentPlayerTurnPseudo = currentPlayerTurnPseudo;
            this.room.players.forEach((player) => {
                player.isItsTurn = player.pseudo === currentPlayerTurnPseudo;
            });
            this.player.isItsTurn = this.room.players.find((p) => p.pseudo === this.player.pseudo)?.isItsTurn || false;

            if (this.room.roomInfo.isSolo && this.bot && this.bot.pseudo === currentPlayerTurnPseudo) {
                this.socketClientBotService.send('botPlayAction');
            }
        });
        this.socketService.on('timeUpdated', (time: number) => {
            this.remainingTime = time;
        });

        this.socketService.on('playerLeft', (player: Player) => {
            const beginnersNames = this.beginners.map((e) => e.name);
            const botName = beginnersNames.filter((name) => name !== this.player.pseudo)[Math.floor(Math.random() * beginnersNames.length)];

            this.socketClientBotService.send('convertToRoomSoloBot', {
                roomName: this.room.roomInfo.name,
                botName,
                points: player.points,
            });

            this.sessionStorageService.removeItem('data');
        });

        this.socketService.on('gameIsOver', (winnerArray: Player[]) => {
            this.room.roomInfo.isGameOver = true;
            this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
            this.setPlayersTurnToFalse();
            this.findWinner(winnerArray);
            this.showEndGameDialog(winnerArray);
        });

        this.socketService.on('updatePlayerScore', (player: Player) => {
            const playerToUpdate = this.getPlayer(player.pseudo);
            if (!playerToUpdate) return;
            playerToUpdate.points = player.points;
        });

        this.socketService.on('convertToRoomSoloBotStatus', () => {
            this.room.roomInfo.isSolo = true;
        });

        this.socketService.on('botInfos', (bot: Player) => {
            this.bot = bot;
            if (this.room.players.length === 1) {
                this.room.players.push(bot);
                return;
            }
            const playerToSwap = this.room.players.find((player) => player.pseudo !== this.player.pseudo);
            if (!playerToSwap) return;
            this.room.players[this.room.players.indexOf(playerToSwap)] = bot;
        });
    }

    private setPlayersTurnToFalse() {
        for (const player of this.room.players) {
            player.isItsTurn = false;
        }
    }

    private findWinner(winnerArray: Player[]) {
        if (!winnerArray || winnerArray.length === 0) return;
        if (winnerArray.length <= 1) {
            this.winnerPseudo = winnerArray[0].pseudo;
        }
        this.numberOfWinner = winnerArray.length;
    }
}
