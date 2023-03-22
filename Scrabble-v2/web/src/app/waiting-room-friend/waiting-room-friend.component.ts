import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { MAX_LENGTH_PSEUDO, MIN_LENGTH_PSEUDO } from '@app/constants/constants';
import {
    GAME_REJECTION_BY_ADVERSARY,
    INVALID_PSEUDO,
    INVALID_PSEUDO_LENGTH,
    ROOM_ERROR,
    WAITING_FOR_CONFIRMATION,
} from '@app/constants/status-constants';
import { InvitationService } from '@app/invitation.service';
import { PseudoService } from '@app/pseudo.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-waiting-room-friend',
    templateUrl: './waiting-room-friend.component.html',
    styleUrls: ['./waiting-room-friend.component.scss'],
})
export class WaitingRoomFriendComponent implements OnInit, OnDestroy {
    availableRooms: Room[];
    pseudo: string;
    pw: string;
    isPseudoValid: boolean;
    isInRoom: boolean;
    isRejected: boolean;
    canJoinRoom: boolean;
    isConnected: boolean;
    roomName: string;
    start: boolean;
    isPending: boolean;
    constructor(
        private socketService: SocketClientService,
        private router: Router,
        private user: PseudoService,
        public room: Room,
        public player: Player,
        private invitationService: InvitationService,
    ) {
        this.isPseudoValid = true;
        this.canJoinRoom = true;
        this.isInRoom = false;
        this.invitationService.isInRoom = false;
        this.isRejected = false;
        this.room.roomInfo.name = '';
        this.availableRooms = [];
        this.player.pseudo = this.user.pseudo;
        this.pseudo = this.user.pseudo;
        this.pw = '';
        this.isConnected = false;
        this.start = false;
        this.isPending = false;
    }
    @HostListener('window:beforeunload') onBeforeUnload() {
        if (this.isInRoom) {
            if (this.roomName) this.leaveRoom(this.roomName);
        }
        this.stopSocketlisteners();
        this.isConnected = false;
        // TODO: deconnect and go to login page
    }
    ngOnDestroy() {
        if (this.isInRoom && !this.start) {
            if (this.roomName) this.leaveRoom(this.roomName);
        }
        this.start = false;
        this.stopSocketlisteners();
        this.isConnected = false;
        this.isPending = false;
    }
    ngOnInit() {
        this.connect();
        this.getAvailableRooms();
        this.askToJoin(this.invitationService.room);
    }

    get roomStatusText(): string {
        if (this.isInRoom) return "Vous êtes dans la salles d'attentes";
        if (this.isPending) return WAITING_FOR_CONFIRMATION;
        if (this.isRejected) return GAME_REJECTION_BY_ADVERSARY;
        if (this.pseudo.length > MAX_LENGTH_PSEUDO) return INVALID_PSEUDO_LENGTH;
        if (!this.isPseudoValid) return INVALID_PSEUDO;
        if (!this.canJoinRoom) return ROOM_ERROR;
        return '';
    }

    isRoomStatusTextEmpty(): boolean {
        return this.roomStatusText === '';
    }

    observeGame(room: Room) {
        this.isRejected = false;
        this.isPseudoValid = true;
        this.isInRoom = true;
        this.invitationService.isInRoom = true;
        this.availableRooms.splice(this.availableRooms.indexOf(room), 1);
        this.player.pseudo = this.pseudo;
        this.player.isCreator = false;
        this.player.socketId = this.socketService.socket.id;
        this.player.isObserver = true;
        this.setRoomServerToThisRoom(room);
        this.socketService.send('requestToObserve', { roomName: room.roomInfo.name, player: this.player });
        this.room.currentPlayerPseudo = this.pseudo;
        this.router.navigate(['/observe']);
    }
    // TODO: Make server link

    askToJoin(creatorRoom: Room) {
        this.isRejected = false;

        if (!this.canJoinCreatorRoom(creatorRoom)) return;

        this.isPseudoValid = true;
        this.isPending = true;
        console.error(creatorRoom);
        this.availableRooms.splice(this.availableRooms.indexOf(creatorRoom), 1);
        this.player.pseudo = this.pseudo;
        this.player.isCreator = false;
        this.player.socketId = this.socketService.socket.id;
        this.setRoomServerToThisRoom(creatorRoom);
        this.roomName = creatorRoom.roomInfo.name;
        this.socketService.send('requestToJoin', { roomName: creatorRoom.roomInfo.name, player: this.player });
    }

    joinRandomRoom() {
        if (this.roomsWithMyGameType.length === 0) return;
        const maxIndex = this.roomsWithMyGameType.length - 1;
        const roomIndex = Math.floor(Math.random() * (maxIndex + 1));
        this.askToJoin(this.roomsWithMyGameType[roomIndex]);
    }

    getAvailableRooms() {
        this.socketService.send('availableRooms');
    }

    leaveRoom(roomName: string) {
        this.socketService.send('leaveRoomOther', { room: roomName, player: this.player });
        this.room.roomInfo.name = '';
        this.isInRoom = false;
        this.invitationService.isInRoom = false;
        this.isPending = false;
        this.isRejected = true;
    }

    validateName(room: Room): boolean {
        return this.pseudoIsDifferentFromAdversary(room) && this.isPseudoLengthValid();
    }

    get roomsWithMyGameType(): Room[] {
        return this.availableRooms.filter((room) => room.roomInfo.gameType === this.room.roomInfo.gameType);
    }

    get hasValidName(): boolean {
        return this.pseudo.length >= MIN_LENGTH_PSEUDO && this.pseudo.length <= MAX_LENGTH_PSEUDO;
    }

    websiteHasAvailableRooms(): boolean {
        return this.availableRooms && this.availableRooms.length > 0;
    }
    private pseudoIsDifferentFromAdversary(room: Room): boolean {
        return room.players[0].pseudo !== this.pseudo;
    }
    private isPseudoLengthValid(): boolean {
        return this.pseudo.length >= MIN_LENGTH_PSEUDO && this.pseudo.length <= MAX_LENGTH_PSEUDO;
    }
    private connect() {
        // if (this.socketService.isSocketAlive()) {
        //     this.socketService.disconnect();
        // }
        // this.socketService.connect();
        if (!this.isConnected) {
            this.configureBaseSocketFeatures();
            this.isConnected = true;
        }
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('playerAccepted', (roomCreator: Room) => {
            sessionStorage.removeItem('data');
            this.setRoomServerToThisRoom(roomCreator);
            this.room.currentPlayerPseudo = this.pseudo;
            this.start = true;
            this.router.navigate(['/game']);
        });

        this.socketService.on('playerRejected', (roomCreator: Room) => {
            this.leaveRoom(roomCreator.roomInfo.name);
        });

        this.socketService.on('updateAvailableRoom', (rooms: Room[]) => {
            this.availableRooms = rooms;
        });
        this.socketService.on('inRoom', () => {
            this.isInRoom = true;
            this.invitationService.isInRoom = true;
            this.socketService.send('join-channel', {
                email: this.user.email,
                name: this.room.roomInfo.name,
            });
        });
    }

    private stopSocketlisteners() {
        this.socketService.remove('playerAccepted');
        this.socketService.remove('playerRejected');
        this.socketService.remove('updateAvailableRoom');
    }

    private canJoinCreatorRoom(room: Room): boolean {
        if (!room || room?.players.length < 1) {
            this.canJoinRoom = false;
            this.availableRooms.splice(this.availableRooms.indexOf(room), 1);
            return false;
        }

        if (!this.validateName(room)) {
            this.isPseudoValid = false;
            return false;
        }

        this.canJoinRoom = true;
        return true;
    }

    private setRoomServerToThisRoom(roomServer: Room) {
        this.room.roomInfo.name = roomServer.roomInfo.name;
        this.room.roomInfo.timerPerTurn = roomServer.roomInfo.timerPerTurn;
        this.room.roomInfo.dictionary = roomServer.roomInfo.dictionary;
        this.room.roomInfo.gameType = roomServer.roomInfo.gameType;
        this.room.players = roomServer.players;
    }
}
