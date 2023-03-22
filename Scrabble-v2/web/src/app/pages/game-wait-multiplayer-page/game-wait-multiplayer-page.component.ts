import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameData } from '@app/classes/game-data';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { GONE_RESSOURCE_MESSAGE } from '@app/constants/http-constants';
// import { ElectronWindowsCommunicationService } from '@app/electron-windows-communication.service';
import { ErrorDialogComponent } from '@app/error-dialog/error-dialog.component';
import { HttpService } from '@app/http.service';
import { InviteFriendsComponent } from '@app/invite-friends/invite-friends.component';
// import { DataToChatWindow } from '@app/interfaces/electron-windows-communication';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { GameDataService } from '@app/services/game-data.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { SoundService } from '@app/services/sound.service';

@Component({
    selector: 'app-game-wait-multiplayer-page',
    templateUrl: './game-wait-multiplayer-page.component.html',
    styleUrls: ['./game-wait-multiplayer-page.component.scss'],
    providers: [],
})
export class GameWaitMultiplayerPageComponent implements OnInit, OnDestroy {
    pendingPlayers: Player[];
    readyToStart: boolean;
    playerName: string;
    gameData: GameData;
    dictionaryExistsOnServer: boolean;
    isConnected: boolean;
    start: boolean;
    constructor(
        private socketService: SocketClientService,
        public room: Room,
        public gameDataService: GameDataService,
        private httpService: HttpService,
        private dialog: MatDialog,
        private router: Router,
        private soundService: SoundService, // private electronService: ElectronWindowsCommunicationService,
    ) {
        this.readyToStart = false;
        this.playerName = this.room.currentPlayerPseudo;
        this.gameData = this.gameDataService.data;
        this.dictionaryExistsOnServer = true;
        this.pendingPlayers = [];
        this.isConnected = false;
        this.start = false;
    }
    @HostListener('window:beforeunload') onBeforeUnload() {
        this.leaveRoom();
        this.stopSocketlisteners();
        this.isConnected = false;
        // TODO: deconnect and go to login page
    }

    ngOnInit() {
        this.start = false;
        this.connect();
    }

    ngOnDestroy() {
        if (!this.start) this.leaveRoom();
        this.stopSocketlisteners();
        this.isConnected = false;
    }

    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    leaveRoom() {
        this.socketService.send('leaveRoomCreator', this.room.roomInfo.name);
        this.rejectPlayers();
    }
    async addPlayerPending(index: number) {
        this.room.players.push(this.pendingPlayers[index]);
        this.socketService.send('acceptPlayer', { roomName: this.room.roomInfo.name, player: this.pendingPlayers[index] });
        this.pendingPlayers.splice(index, 1);
        if (this.room.players.length === this.room.roomInfo.nbHumans) this.readyToStart = true;
    }

    async acceptPlayers() {
        this.start = true;
        await this.dictionarySelectedStillExists(this.room.roomInfo.dictionary);
        if (this.httpService.anErrorOccurred()) {
            this.handleHttpError();
            return;
        }
        this.room.currentPlayerPseudo = this.playerName;
        this.socketService.send('acceptPlayers', this.room);
        this.router.navigate(['/game']);
    }

    rejectPlayers() {
        this.socketService.send('rejectAllPlayers', { room: this.room, pendingPlayers: this.pendingPlayers });
        this.router.navigate(['/home']);
    }

    rejectPlayer(player: Player) {
        this.socketService.send('rejectPlayer', { room: this.room, rejectedPlayer: player });
    }

    openInvitationPopup() {
        this.dialog.open(InviteFriendsComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: this.room,
        });
    }

    onGoToSolo() {
        this.socketService.send('leaveRoomCreator', this.room.roomInfo.name);
    }

    get firstPlayerPseudo(): string {
        return this.room.players[0] ? this.room.players[0].pseudo : '...';
    }

    get secondPlayerPseudo(): string {
        return this.room.players[1] ? this.room.players[1].pseudo : '...';
    }

    get thirdPlayerPseudo(): string {
        if (this.room.players[2]) return this.room.players[2].pseudo;
        if (this.readyToStart) return 'bot';
        return '...';
    }

    get forthPlayerPseudo(): string {
        if (this.room.players[3]) return this.room.players[3].pseudo;
        if (this.readyToStart) return 'bot';
        return '...';
    }

    get roomStatusText(): string {
        return 'room.wait';
    }

    private handleHttpError() {
        if (this.isDictionaryDeleted()) {
            this.dictionaryExistsOnServer = false;
            this.leaveRoom();
            this.rejectPlayers();
            this.showErrorDialog(this.generateDeleteDictionaryMessage());
            return;
        }
        this.showErrorDialog(this.httpService.getErrorMessage());
        return;
    }

    private generateDeleteDictionaryMessage() {
        return `Malheureusement, le dictionnaire "${this.room.roomInfo.dictionary}" de votre partie n'existe plus sur notre serveur.
        Par conséquent, cette partie ne peut pas être lancée.`;
    }
    private showErrorDialog(message: string) {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: message,
        });
    }
    private isDictionaryDeleted(): boolean {
        return this.httpService.getErrorMessage() === GONE_RESSOURCE_MESSAGE;
    }
    private async dictionarySelectedStillExists(title: string): Promise<boolean> {
        const dictionary = await this.httpService.getDictionary(title, false).toPromise();
        return dictionary?.title === title;
    }

    private connect() {
        // if (this.socketService.isSocketAlive()) return;
        //     this.socketService.connect();
        // }
        if (!this.isConnected) {
            this.configureBaseSocketFeatures();
            this.isConnected = true;
        }
    }
    private stopSocketlisteners() {
        this.socketService.remove('playerWantsToJoin');
        // this.socketService.remove('join-channel');
        this.socketService.remove('playerFound');
        this.socketService.remove('playerLeft');
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('playerWantsToJoin', (player: Player) => {
            if (this.room.roomInfo.isPublic && this.room.players.length < this.room.roomInfo.nbHumans) {
                this.room.players.push(player);
                this.socketService.send('acceptPlayer', { roomName: this.room.roomInfo.name, player });
            } else if (!this.room.roomInfo.isPublic) this.pendingPlayers.push(player);
            else this.rejectPlayer(player);

            if (this.room.players.length === this.room.roomInfo.nbHumans) this.readyToStart = true;
            else this.readyToStart = false;
        });
        // TODO remove this when there is only one socket in the whole app
        //      This code would not be necessary if we did not disconnect the socket created when logging in
        //      see ChatService because it has a 'this.socketService.on('join-channel') already
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // this.socketService.on('join-channel', (channel: any) => {
        //     const data: DataToChatWindow = {
        //         electronEvent: 'join-channel',
        //         electronEventData: channel,
        //     };
        //     alert('received join-channel. I am going to alert the chatWindow');
        //     this.electronService.sendEventToChatWindow(data);
        //     return channel;
        // });

        this.socketService.on('playerFound', (room: Room) => {
            this.room.players = room.players;
            // this.otherPlayerExist = true;
        });

        this.socketService.on('playerLeft', (playerName: string) => {
            sessionStorage.removeItem('data');
            for (const player of this.room.players) {
                if (player.pseudo === playerName) {
                    this.room.players.splice(this.room.players.indexOf(player), 1);
                    this.readyToStart = false;
                }
            }
            for (const pendingPlayer of this.pendingPlayers) {
                if (pendingPlayer.pseudo === playerName) {
                    this.pendingPlayers.splice(this.pendingPlayers.indexOf(pendingPlayer), 1);
                }
            }
        });
    }
}
