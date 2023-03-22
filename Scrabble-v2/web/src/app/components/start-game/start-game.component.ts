import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { GONE_RESSOURCE_MESSAGE } from '@app/constants/http-constants';
import { HttpService } from '@app/http.service';
import { PseudoService } from '@app/pseudo.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { SoundService } from '@app/services/sound.service';

@Component({
    selector: 'app-start-game',
    templateUrl: './start-game.component.html',
    styleUrls: ['./start-game.component.scss'],
})
export class StartGameComponent implements OnInit, OnDestroy {
    @Input() isPublic: boolean;
    @Input() gameForm: FormGroup | undefined;
    @Output() private dictionaryDeleted;
    @Output() private httpError;
    onProcess: boolean;
    isConnected: boolean;
    constructor(
        private socketService: SocketClientService,
        private router: Router,
        public room: Room,
        public player: Player,
        private httpService: HttpService,
        private soundService: SoundService,
        private pseudoService: PseudoService,
    ) {
        this.dictionaryDeleted = new EventEmitter<void>();
        this.httpError = new EventEmitter<void>();
        this.onProcess = false;
        this.isConnected = false;
    }
    ngOnDestroy() {
        this.stopSocketlisteners();
        this.isConnected = false;
        this.room = new Room();
    }

    ngOnInit() {
        if (!this.isConnected) {
            this.connect();
            this.isConnected = true;
        }
    }

    connect() {
        // if (this.socketService.isSocketAlive()) {
        //     this.socketService.disconnect();
        // }
        // this.socketService.connect();
        this.configureBaseSocketFeatures();
    }

    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }
    configureBaseSocketFeatures() {
        this.socketService.on('joinRoomStatus', (serverRoomName: string) => {
            this.onProcess = false;
            if (!serverRoomName.startsWith('Room')) return;
            this.room.roomInfo.name = serverRoomName;
            this.router.navigate(['/game/multiplayer/wait']);
        });
    }
    stopSocketlisteners() {
        this.socketService.remove('joinRoomStatus');
    }

    async joinRoom() {
        if (!this.gameForm) return;
        if (!this.hasValidGameType) return;
        if (!this.dictionaryExists()) return;
        const dictionary = this.gameForm.controls.dictionary as FormControl;
        await this.dictionarySelectedExists(dictionary.value);
        if (this.httpService.anErrorOccurred()) {
            this.handleHttpError();
            return;
        }
        this.initializeRoom();
        this.onProcess = true;
        // this.socketService.send('join-channel', {
        //     email: this.pseudoService.email,
        //     name: this.room.roomInfo.name,
        // });
        this.socketService.send('joinRoom', this.room);
    }
    get hasValidGameType(): boolean {
        return ['classic', 'log2990'].includes(this.room.roomInfo.gameType);
    }

    get isFormValid(): boolean {
        if (!this.gameForm) return false;
        return this.gameForm.valid && this.isDictionarySelected();
    }

    private dictionaryExists(): boolean {
        if (!this.gameForm) return false;
        const dictionary = this.gameForm.controls.dictionary as FormControl;
        return dictionary && dictionary.value !== '';
    }
    private handleHttpError() {
        if (this.httpService.getErrorMessage() !== GONE_RESSOURCE_MESSAGE) {
            this.httpError.emit();
            return;
        }
        this.dictionaryDeleted.emit();
        return;
    }

    private isDictionarySelected(): boolean {
        if (!this.gameForm) return false;
        const dictionary = this.gameForm.controls.dictionary as FormControl;
        if (!dictionary.value) return false;
        return true;
    }

    private async dictionarySelectedExists(title: string): Promise<boolean> {
        const dictionary = await this.httpService.getDictionary(title, false).toPromise();
        return dictionary?.title === title;
    }

    private initializeRoom() {
        if (!this.gameForm) return;
        const dictionary = this.gameForm.controls.dictionary as FormControl;
        const pseudo = this.pseudoService.pseudo;
        const timerPerTurn = this.gameForm.controls.timerPerTurn as FormControl;
        const nbHumans = this.gameForm.controls.nbHumans as FormControl;
        const pw = this.gameForm.controls.pw as FormControl;
        this.room.currentPlayerPseudo = pseudo;
        this.room.roomInfo.timerPerTurn = timerPerTurn.value;
        this.room.roomInfo.dictionary = dictionary.value;
        this.room.roomInfo.pw = pw.value;
        this.player.pseudo = pseudo;
        this.player.isCreator = true;
        this.player.socketId = this.socketService.socket.id;
        this.room.players = [this.player];
        this.room.roomInfo.nbHumans = nbHumans.value;
        this.room.roomInfo.isPublic = this.isPublic;
    }
}
