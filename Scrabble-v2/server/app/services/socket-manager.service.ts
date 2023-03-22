import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { CommandController } from '@app/controllers/command.controller';
import { CreateChannelDto, Message } from '@app/interfaces/chat';
import { Invitation } from '@app/interfaces/invitation';
import { JoinInterface } from '@app/interfaces/join-interface';
import { PlayerData } from '@app/interfaces/player-data';
import * as http from 'http';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { ChatService } from './chat.service';
import { DateService } from './date.service';
import { Firebase } from './firebase.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { SocketGameService } from './socket-game.service';
import { SocketHandlerService } from './socket-handler.service';
import { SocketRoomService } from './socket-room.service';
import { UserService } from './user.service';

export class SocketManager {
    sio: io.Server;
    commandController: CommandController;
    sockets: Map<string, io.Socket>;
    private socketHandlerService: SocketHandlerService;
    private socketRoomService: SocketRoomService;
    private socketGameService: SocketGameService;
    private chatMessageService: ChatMessageService;
    private chatService: ChatService;
    constructor(server: http.Server, private gamesHistoryService: GamesHistoryService, private firebase: Firebase, private userService: UserService) {
        this.chatMessageService = new ChatMessageService();
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.sockets = new Map<string, io.Socket>();
        const singleRoomService = new RoomService();
        const singleDateService = new DateService();

        this.socketHandlerService = new SocketHandlerService(
            this.sio,
            gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
            userService,
        );
        this.socketRoomService = new SocketRoomService(
            this.sio,
            this.gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
            userService,
        );
        this.socketGameService = new SocketGameService(
            this.sio,
            this.gamesHistoryService,
            this.chatMessageService,
            singleRoomService,
            singleDateService,
            userService,
        );
        this.chatService = new ChatService(this.firebase, this.sio, userService);
        this.commandController = new CommandController(this.chatMessageService);
    }

    handleSockets() {
        this.sio.on('connection', (socket) => {
            this.sockets.set(socket.id, socket);
            // ***** CHANNELS HANDLING ***** //
            if (this.userService.isModified) {
                socket.emit('active-user-modified', { code: 200, message: 'Que Dieu te benisse' });
                this.userService.isModified = false;
            }
            this.userService.connectedUsers.subscribe((users) => {
                socket.emit('active-user-modified', { code: 200, message: users });
            });
            this.userService.usersInGame.subscribe((users) => {
                socket.emit('users-in-game', { code: 200, message: users });
            });

            socket.on('authentify', (email) => {
                this.userService.authentifySocket(email, socket);
            });

            socket.on('create-private-conversation', (data: { email: string; friendUsername: string }) => {
                this.chatService.createPrivateConversation(socket, data.email, data.friendUsername);
            });
            socket.on('create-channel', async (channelDto: CreateChannelDto) => {
                await this.chatService.createChannel(channelDto, socket);
            });
            socket.on('delete-channel', async ({ name, email }: { name: string; email: string }) => {
                if (!name || !email) socket.emit('delete-channel', { code: 400, message: 'Bad request' });
                await this.chatService.deleteChannel(name, email, socket);
            });
            socket.on('get-channels-list', async () => {
                const channels = await this.chatService.getChannels();
                socket.emit('get-channels-list', channels);
            });
            socket.on('join-channel', async ({ email, name }: { email: string; name: string }) => {
                console.error(`I joined ${name} from ${email}`);
                if (!name || !email) socket.emit('join-channel', { code: 400, message: 'Bad request' });
                this.chatService.joinChannel({ email, name, socket });
            });
            socket.on('leave-channel', async ({ email, name }: { email: string; name: string }) => {
                if (!name || !email) socket.emit('leave-channel', { code: 400, message: 'Bad request' });
                await this.chatService.leaveChannel({ email, name, socket });
            });
            socket.on('get-user-channels', async ({ email }: { email: string }) => {
                if (!email) socket.emit('get-user-channels', { code: 400, message: 'Bad request' });
                const channels = await this.chatService.getUserChannels(email, socket);
                socket.emit('get-user-channels', channels);
            });

            socket.on('send-invitation', async (invitation: Invitation) => {
                if (this.userService.authedSockets.has(invitation.usernameReceiver)) {
                    const authedFriend = this.userService.authedSockets.get(invitation.usernameReceiver);
                    const room = this.socketRoomService.roomService.getRoom(invitation.room.roomInfo.name);
                    if (room !== undefined) invitation.room = room;
                    if (authedFriend !== undefined) this.sio.to(authedFriend?.socket.id).emit('invite-friend', invitation);
                }
            });

            socket.join('General');

            socket.on('giveUp', async () => {
                await this.socketHandlerService.handleDisconnecting(socket);
            });
            socket.on('disconnecting', async () => {
                await this.socketHandlerService.handleDisconnecting(socket);
            });

            socket.on('reconnect', (playerData: PlayerData) => {
                this.socketHandlerService.handleReconnect(socket, playerData);
            });

            socket.on('getPlayerInfos', (roomName) => {
                this.socketGameService.handleGetPlayerInfo(socket, roomName);
            });

            socket.on('getRackInfos', (roomName) => {
                this.socketGameService.handleGetRackInfo(socket, roomName);
            });

            socket.on('joinRoom', (room: Room) => {
                this.socketRoomService.handleJoinRoom(socket, room);
            });

            // socket.on('joinRoomSolo', (room: Room) => {
            //     this.socketRoomService.handleJoinRoomSolo(socket, room);
            // });

            socket.on('joinRoomSoloBot', (data: { roomName: string; botName: string; isExpertLevel: boolean }) => {
                this.socketRoomService.handleJoinRoomSoloBot(socket, data);
            });

            socket.on('convertToRoomSoloBot', (data: { roomName: string; botName: string; points: number; isExpertLevel: boolean }) => {
                this.socketHandlerService.handleConvertToRoomSoloBot(socket, data);
                const room = this.socketRoomService.roomService.getRoom(data.roomName);
                this.socketGameService.handleChangeTurn(socket, room?.getCurrentPlayerTurn()?.username as string);
                this.socketGameService.sendToEveryoneInRoom(data.roomName, 'playerTurnChanged', room?.getCurrentPlayerTurn()?.username);
            });

            socket.on('leaveRoomCreator', (roomName: string) => {
                this.socketRoomService.handleLeaveRoomCreator(socket, roomName, this.sockets);
            });

            socket.on('leaveRoomOther', (response: { room: string; player: Player }) => {
                this.socketRoomService.handleLeaveRoomOther(socket, response);
            });

            socket.on('setRoomAvailable', (roomName: string) => {
                this.socketRoomService.handleSetRoomAvailable(socket, roomName);
            });

            socket.on('askToJoin', (room: Room) => {
                this.socketRoomService.handleAskToJoin(socket, room);
            });

            socket.on('requestToJoin', (join: JoinInterface) => {
                this.socketRoomService.askToJoin(join);
            });

            socket.on('requestToObserve', (join: JoinInterface) => {
                this.socketRoomService.observeGame(this.sockets, join);
            });

            socket.on('acceptPlayers', (room: Room) => {
                this.socketRoomService.handleAcceptPlayers(this.sockets, room);
            });

            socket.on('acceptPlayer', (addInterface: { roomName: string; player: Player }) => {
                this.socketRoomService.handleAcceptPlayer(this.sockets, addInterface);
            });
            socket.on('rejectPlayers', (room: Room) => {
                this.socketRoomService.handleRejectPlayers(this.sockets, room);
            });

            socket.on('rejectPlayer', (response: { room: Room; rejectedPlayer: Player }) => {
                this.socketRoomService.handleRejectPlayer(response);
            });

            socket.on('rejectAllPlayers', (response) => {
                // response = { room: Room, pendingPlayers: Player[]}
                this.socketRoomService.handleRejectAllPlayers(this.sockets, response);
            });

            socket.on('command', (command: string) => {
                this.socketGameService.handleCommand(socket, command);
            });

            socket.on('message', (message: Message) => {
                this.chatService.broadcastMessageInChannel(message, socket);
            });

            socket.on('availableRooms', () => {
                this.socketRoomService.handleAvailableRooms(socket);
            });

            socket.on('startGame', () => {
                this.socketGameService.handleStartGame(socket);
            });

            socket.on('changeTurn', (roomName: string) => {
                this.socketGameService.handleChangeTurn(socket, roomName);
            });

            socket.on('botPlayAction', async () => {
                await this.socketGameService.handleBotPlayAction(socket);
            });

            socket.on('getAllGoals', () => {
                this.socketGameService.handleGetAllGoals(socket);
            });

            socket.on('drawBoardCursor', (coord: { roomName: string; x: number; y: number }) => {
                this.socketRoomService.setStartCursor(socket, coord);
            });

            socket.on('fetchBoard', (roomName: string) => {
                this.socketGameService.fetchBoard(socket, roomName);
            });
            socket.on('drawRacks', (roomName: string) => {
                this.socketRoomService.drawRacks(roomName);
            });

            socket.on('replaceBot', (data: { roomName: string; observer: Player; bot: Player }) => {
                this.socketGameService.replaceBot(data);
            });
        });
    }
}
