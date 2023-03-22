import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { GameLevel } from '@app/enums/game-level';
import { JoinInterface } from '@app/interfaces/join-interface';
import * as io from 'socket.io';
import { SocketHandlerService } from './socket-handler.service';

const MAX_PLAYERS = 4;
export class SocketRoomService extends SocketHandlerService {
    handleAcceptPlayer(sockets: Map<string, io.Socket>, addInterface: { roomName: string; player: Player }) {
        const room = this.roomService.getRoom(addInterface.roomName);
        if (!room) return;
        room.nbHumanPlayers++;
        room.nbBots--;
        this.socketJoin(sockets.get(addInterface.player.socketId) as io.Socket, room.roomInfo.name);
        this.socketEmitTo(addInterface.player.socketId, 'inRoom');
        this.addPlayerToGameChannel(sockets.get(addInterface.player.socketId) as io.Socket, addInterface.roomName);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }
    setStartCursor(socket: io.Socket, coord: { roomName: string; x: number; y: number }) {
        if (!coord.roomName) return;
        const room = this.roomService.getRoom(coord.roomName);
        if (!room) return;
        for (const player of room.players) {
            if (player.pseudo.startsWith('bot ')) continue;
            this.socketEmitTo(player.socketId, 'drawBoardCursor', { x: coord.x, y: coord.y });
        }
    }
    handleJoinRoomSolo(socket: io.Socket, room: Room) {
        if (!room) return;
        if (!room.roomInfo.isSolo) return;
        const availableRoom = this.roomService.createRoom(room);
        this.socketJoin(socket, availableRoom.roomInfo.name);
        this.sendToEveryoneInRoom(socket.id, 'joinRoomSoloStatus', availableRoom.roomInfo.name);
    }

    handleJoinRoomSoloBot(socket: io.Socket, data: { roomName: string; botName: string; isExpertLevel: boolean }) {
        if (!data.roomName) return;
        const room = this.roomService.getRoom(data.roomName);
        if (!room) return;
        const desiredLevel = !data.isExpertLevel ? GameLevel.Beginner : GameLevel.Expert;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        room.createPlayerVirtual(socket.id, `bot ${room.botsCount++}`, desiredLevel);
        this.socketJoin(socket, room.roomInfo.name);
        // this.sendToEveryoneInRoom(room.roomInfo.name, 'botInfos', room.bot);
        this.roomService.setUnavailable(room.roomInfo.name);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }

    handleJoinRoom(socket: io.Socket, room: Room) {
        if (!room) return;
        const availableRoom = this.roomService.createRoom(room);
        availableRoom.nbBots--;
        this.socketJoin(socket, availableRoom.roomInfo.name);
        this.sendToEveryoneInRoom(socket.id, 'joinRoomStatus', availableRoom.roomInfo.name);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
        this.addPlayerToGameChannel(socket, availableRoom.roomInfo.name);
    }

    handleLeaveRoomCreator(socket: io.Socket, roomName: string, sockets: Map<string, io.Socket>) {
        if (!this.roomService.isRoomNameValid(roomName)) return;
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        for (const player of room.players) {
            this.sendToEveryoneInRoom(roomName, 'leave-channel', { code: 200, name: roomName, message: 'Successfully gave up and left game.' });
            this.socketLeaveRoom(sockets.get(player.socketId) as io.Socket, roomName);
        }
        this.roomService.removeRoom(roomName);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }

    handleLeaveRoomOther(socket: io.Socket, room: { room: string; player: Player }) {
        if (!this.roomService.isRoomNameValid(room.room)) return;
        this.socketEmitTo(socket.id, 'leave-channel', { code: 200, name: room.room, message: 'Successfully gave up and left game.' });
        this.socketLeaveRoom(socket, room.room);
        const serverRoom = this.roomService.getRoom(room.room);
        if (!serverRoom) return;
        let player = serverRoom.getPlayer(socket.id);
        if (player) serverRoom.removePlayer(player);
        else player = room.player as Player;
        serverRoom.nbHumanPlayers--;
        this.socketEmitTo(serverRoom.players[0]?.socketId ?? '', 'playerLeft', player.pseudo);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }

    handleSetRoomAvailable(socket: io.Socket, roomName: string) {
        this.roomService.setAvailable(roomName);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }
    askToJoin(join: JoinInterface) {
        const serverRoom = this.roomService.getRoom(join.roomName);
        if (!serverRoom) return;
        // TODO check first if there 4 players
        if (serverRoom.players.length === serverRoom.roomInfo.nbHumans) return;
        const creatorSocket = serverRoom.players[0]?.socketId ?? '';
        this.socketEmitTo(creatorSocket, 'playerWantsToJoin', join.player);
    }
    observeGame(sockets: Map<string, io.Socket>, join: JoinInterface) {
        const serverRoom = this.roomService.getRoom(join.roomName);
        if (!serverRoom) return;
        const player = new Player(join.player.socketId, join.player.pseudo, join.player.isCreator);
        player.isObserver = true;
        const socket = sockets.get(player.socketId) as io.Socket;
        this.socketJoin(socket, serverRoom.roomInfo.name);
        serverRoom.players?.push(player);
        serverRoom.getCurrentPlayerTurn();
        this.sendToEveryoneInRoom(serverRoom.roomInfo.name, 'updateRoom', serverRoom);
        this.socketEmit(socket, 'lettersBankCountUpdated', serverRoom.letterBank.getLettersCount());
        this.drawRacks(serverRoom.roomInfo.name);
        this.addPlayerToGameChannel(socket, serverRoom.roomInfo.name);
        const currentTurnPlayer = serverRoom.getCurrentPlayerTurn();
        if (!currentTurnPlayer) return;
        this.socketEmit(socket, 'playerTurnChanged', currentTurnPlayer.pseudo);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }

    handleAskToJoin(socket: io.Socket, room: Room) {
        if (!room) return;
        const roomName = room.roomInfo.name;
        const serverRoom = this.roomService.getRoom(roomName);
        if (!serverRoom) return;
        // TODO check first if there 4 players
        if (room.players.length === room.roomInfo.nbHumans - 1) this.roomService.setUnavailable(roomName);

        const indexOfPlayer = room.players.length - 1;
        const playerToAdd = room.players[indexOfPlayer];
        serverRoom.addPlayer(new Player(playerToAdd.socketId, playerToAdd.username, playerToAdd.isCreator));
        this.socketJoin(socket, roomName);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());

        this.socketEmitRoom(socket, roomName, 'playerFound', serverRoom);
    }

    handleAcceptPlayers(sockets: Map<string, io.Socket>, room: Room) {
        const serverRoom = this.roomService.getRoom(room.roomInfo.name);
        if (!serverRoom) return;
        if (!room) return;
        if (!this.roomService.isRoomNameValid(room.roomInfo.name)) return;
        const playersCopy = room.players;

        for (const player of playersCopy) {
            if (!player.isCreator) {
                serverRoom.addPlayer(new Player(player.socketId, player.pseudo, player.isCreator));
            }
        }
        for (let player = serverRoom.players.length - 1; player < MAX_PLAYERS; player++) {
            serverRoom.createPlayerVirtual(`bot ${serverRoom.botsCount}`, `bot ${serverRoom.botsCount++}`);
            serverRoom.roomInfo.isSolo = true;
        }
        // eslint-disable-next-line
        console.log('Players: ', playersCopy);
        for (const player of playersCopy) {
            if (player.pseudo.startsWith('bot ')) {
                this.sendToEveryoneInRoom(serverRoom.roomInfo.name, 'botInfos', player as VirtualPlayer);
                continue;
            }
            if (player.isCreator) {
                this.socketEmitTo(player.socketId, 'updateRoom', serverRoom);
                continue;
            }
            this.socketJoin(sockets.get(player.socketId) as io.Socket, room.roomInfo.name);
            this.socketEmitTo(player.socketId, 'playerAccepted', serverRoom);
        }
    }

    addPlayerToGameChannel(socket: io.Socket, roomName: string) {
        socket.emit('join-channel', {
            code: 200,
            name: roomName,
            creator: 'system@gmail.com',
            isPublic: false,
            canBeLeft: false,
            canBeDeleted: false,
            message: 'Channel joined successfully',
        });
    }
    removePlayerFromGameChannel(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        socket.emit('leave-channel', { code: 200, name: roomName, message: 'Successfully gave up and left game.' });
        socket.leave(roomName);
    }
    handleRejectPlayers(sockets: Map<string, io.Socket>, room: Room) {
        const serverRoom = this.roomService.getRoom(room.roomInfo.name);
        if (!serverRoom) return;
        if (!this.roomService.isRoomNameValid(room.roomInfo.name)) return;
        for (const player of room.players) {
            this.socketEmitTo(player.socketId, 'playerRejected', serverRoom);
            this.removePlayerFromGameChannel(sockets.get(player.socketId) as io.Socket, room.roomInfo.name);
        }
        this.roomService.setUnavailable(room.roomInfo.name);
        this.roomService.removeRoom(room.roomInfo.name);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }
    handleRejectPlayer(response: { room: Room; rejectedPlayer: Player }) {
        if (!response.room) return;
        const serverRoom = this.roomService.getRoom(response.room.roomInfo.name);
        if (!serverRoom) return;
        if (!this.roomService.isRoomNameValid(response.room.roomInfo.name)) return;
        this.socketEmitTo(response.rejectedPlayer.socketId, 'playerRejected', serverRoom);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }
    handleRejectAllPlayers(sockets: Map<string, io.Socket>, response: { room: Room; pendingPlayers: Player[] }) {
        // response = { room: Room, pendingPlayers: Player[]}
        this.handleRejectPlayers(sockets, response.room);
    }
    handleAvailableRooms(socket: io.Socket) {
        this.sendToEveryoneInRoom(socket.id, 'updateAvailableRoom', this.roomService.getRoomsAvailable());
    }
}
