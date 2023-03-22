/* eslint-disable */
/* eslint-disable max-lines */
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { Timer } from '@app/classes/timer';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { DEFAULT_ROOM_NAME, END_TIMER_VALUE, ONE_SECOND_IN_MS } from '@app/constants/constants';
import { CommandController } from '@app/controllers/command.controller';
import { CommandVerbs } from '@app/enums/command-verbs';
import { CommandResult } from '@app/interfaces/command-result';
import { Game } from '@app/interfaces/game';
import { PlayerData } from '@app/interfaces/player-data';
import * as io from 'socket.io';
import { ChatMessageService } from './chat.message';
import { DateService } from './date.service';
// import { DbGameOperationResult, PlayerGameDocument } from './firebase-games.service';
import { GamesHistoryService } from './games.history.service';
import { RoomService } from './room.service';
import { UserService } from './user.service';

let isTimerSet = false;
export class SocketHandlerService {
    commandController: CommandController;
    timers = new Map<string, NodeJS.Timer>();
    constructor(
        public sio: io.Server,
        private gamesHistoryService: GamesHistoryService,
        public chatMessageService: ChatMessageService,
        public roomService: RoomService,
        public dateService: DateService,
        public userService: UserService,
    ) {
        this.commandController = new CommandController(this.chatMessageService);
        if (!isTimerSet) {
            this.setTimer();
            isTimerSet = true;
        }
    }
    setTimer() {
        setInterval(async () => {
            const rooms = [...this.roomService.getRoomsAvailable(), ...this.roomService.getRoomsUnavailable()];
            for (const room of rooms) {
                if (room.elapsedTime < 0) return;
                ++room.elapsedTime;
                if (room.elapsedTime >= +room.roomInfo.timerPerTurn) {
                    const currentPlayer = room.getCurrentPlayerTurn();
                    if (!currentPlayer) return;
                    // this.sendToEveryoneInRoom(currentPlayer.socketId, 'message', {
                    //     text: `${currentPlayer.username}  a passé son tour.`,
                    //     sender: SYSTEM_NAME,
                    //     destination: room.roomInfo.name,
                    //     color: MessageSenderColors.PLAYER1,
                    // });
                    const otherPlayer = room.players.find((playerInRoom) => playerInRoom !== currentPlayer);
                    if (!otherPlayer) return;
                    // this.sendToEveryoneInRoom(otherPlayer.socketId, 'message', {
                    //     text: `${currentPlayer.username} a passé son tour.`,
                    //     sender: SYSTEM_NAME,
                    //     destination: room.roomInfo.name,
                    //     color: MessageSenderColors.SYSTEM,
                    // });
                    this.changeTurn(room);
                    let currentTurnPlayer = room.getCurrentPlayerTurn();
                    if (!currentTurnPlayer) return;
                    while (currentTurnPlayer.username.startsWith('bot')) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await this.playBotMove(currentTurnPlayer as VirtualPlayer, room, null as any);
                        currentTurnPlayer = room.getCurrentPlayerTurn();
                        if (!currentTurnPlayer) return;
                        this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', currentTurnPlayer.username);
                    }
                } else {
                    this.sendToEveryoneInRoom(room.roomInfo.name, 'timeUpdated', Math.max(+room.roomInfo.timerPerTurn - room.elapsedTime, 0));
                }
            }
        }, ONE_SECOND_IN_MS);
        // room.timerId = timerInterval;
    }

    changeTurn(room: Room) {
        if (!room) return;
        room.elapsedTime = 0;
        room.incrementTurnPassedCounter();
        if (!room.canChangePlayerTurn()) {
            this.handleGamePassFinish(room);
            return;
        }
        room.changePlayerTurn();

        const currentTurnPlayer = room.getCurrentPlayerTurn();
        if (!currentTurnPlayer) return;
        this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', currentTurnPlayer.username);
        return;
    }

    handleConvertToRoomSoloBot(socket: io.Socket, data: { roomName: string; botName: string; points: number; isExpertLevel: boolean }) {
        if (!data.roomName) return;
        const room = this.roomService.getRoom(data.roomName);
        if (!room) return;
        room.createPlayerVirtual(socket.id, data.botName);
        room.roomInfo.isSolo = true;
        room.bot.points = data.points;
        this.socketJoin(socket, room.roomInfo.name);
        this.sendToEveryoneInRoom(room.roomInfo.name, 'botInfos', room.bot);
        this.sendToEveryoneInRoom(room.roomInfo.name, 'convertToRoomSoloBotStatus');
        this.roomService.setUnavailable(room.roomInfo.name);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());

        // const systemAlert: ChatMessage = {
        //     sender: SYSTEM_NAME,
        //     color: MessageSenderColors.SYSTEM,
        //     destination: room.roomInfo.name,

        //     text: 'Votre adversaire a quitté la partie \n Il a été remplacé par le jouer virtuel ' + room.bot.username,
        // };
        // this.sendToEveryone('message', systemAlert);
        // const botGreeting: ChatMessage = {
        //     sender: room.bot.username,
        //     destination: room.roomInfo.name,
        //     color: MessageSenderColors.PLAYER2,
        //     text: room.bot.greeting,
        // };
        // this.sendToEveryone('message', botGreeting);
    }
    sendToEveryoneInRoom(roomName: string, nameEvent: string, dataEvent?: unknown) {
        this.sio.to(roomName).emit(nameEvent, dataEvent);
    }
    sendToEveryone(nameEvent: string, dataEvent: unknown) {
        this.sio.sockets.emit(nameEvent, dataEvent);
    }
    socketJoin(socket: io.Socket, roomName: string) {
        socket.join(roomName);
    }
    socketEmit(socket: io.Socket, nameEvent: string, dataEvent?: unknown) {
        socket.emit(nameEvent, dataEvent);
    }
    socketEmitTo(socketId: string, nameEvent: string, dataEvent?: unknown) {
        this.sio.to(socketId).emit(nameEvent, dataEvent);
    }
    socketEmitRoom(socket: io.Socket, roomName: string, nameEvent: string, dataEvent?: unknown) {
        socket.to(roomName).emit(nameEvent, dataEvent);
    }
    socketLeaveRoom(socket: io.Socket, roomName: string) {
        socket.leave(roomName);
    }
    getCountHumans(room: Room): number {
        let countHumans = 0;
        for (const player of room.players) {
            if (!player.username.startsWith('bot ') && !player.isObserver) countHumans++;
        }
        return countHumans;
    }

    async handleDisconnecting(socket: io.Socket) {
        const roomName = this.getSocketRoom(socket) as string;
        socket.emit('leave-channel', { code: 200, name: roomName, message: 'Successfully gave up and left game.' });
        this.socketLeaveRoom(socket, roomName);

        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        //
        console.log('==========================================');        
        const playerThatGaveUp = room.getPlayer(socket.id);
        if (!playerThatGaveUp) return;
        if( playerThatGaveUp.isObserver) {
            room.removePlayer(playerThatGaveUp);
            return;
        }
        if (!playerThatGaveUp.isGameSavedOnDB && !playerThatGaveUp.isObserver) {
            this.userService.saveGamePlayed(playerThatGaveUp, 'A', DateService.getParsableTimestamp());}
        console.log('==========================================');
        //
        if (room.players.length <= 1) {
            this.roomService.removeRoom(roomName);
        } else {
            const player = room.getPlayer(socket.id);
            if (!player) return;
            this.removeOneUserInGame(player);
            if (this.getCountHumans(room) === 1) {
                // if (room.turnPassedCounter < COUNT_PLAYER_TURN) {
                //     // this.updateLeaderboard(room);
                // }
                room.roomInfo.surrender = 'Mode solo abandonné';
                await this.updateGame(room).then(() => {
                    room.removePlayer(player);
                });
                room.elapsedTime = END_TIMER_VALUE;
                player.points = 0;
                this.sendToEveryoneInRoom(
                    roomName,
                    'gameIsOver',
                    room.players.filter((playerInRoom) => playerInRoom !== player),
                );
                this.roomService.removeRoom(roomName);
                // this.displayGameResume(room);
                room.removePlayers();
                this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (!player.isObserver) room.replaceHuman(`bot ${room.botsCount++}`, player);
            else room.removePlayer(player);
            this.sendToEveryoneInRoom(room.roomInfo.name, 'updateRoom', room);
            let currentTurnPlayer = room.getCurrentPlayerTurn();
            if (!currentTurnPlayer) return;
            while (currentTurnPlayer.username.startsWith('bot ')) {
                await this.playBotMove(currentTurnPlayer as VirtualPlayer, room, socket);
                currentTurnPlayer = room.getCurrentPlayerTurn();
                if (!currentTurnPlayer) return;
                this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', currentTurnPlayer.username);
            }
            this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', room.getCurrentPlayerTurn()?.username);
        }
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }
    async playBotMove(currentTurnPlayer: VirtualPlayer, room: Room, socket: io.Socket) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        await Timer.wait(2000);
        const botmsg = await (currentTurnPlayer as VirtualPlayer).playTurn();
        const executionResult = this.commandController.executeCommand(botmsg, room, currentTurnPlayer) as CommandResult;
        this.sendToEveryoneInRoom(room.roomInfo.name, 'botPlayedAction', botmsg);
        // if (socket)
        //     this.socketEmitRoom(socket, room.roomInfo.name, 'message', {
        //         text: botmsg,
        //         sender: currentTurnPlayer,
        //         destination: room.roomInfo.name,
        //         color: MessageSenderColors.PLAYER2,
        //     });
        this.notifyViewBasedOnCommandResult(executionResult, room, currentTurnPlayer, socket);
    }
    notifyViewBasedOnCommandResult(report: CommandResult, room: Room, sender: Player, socket: io.Socket) {
        if (!report || !room || !sender) return;
        switch (report.commandType) {
            case CommandVerbs.PLACE:
                this.sendToEveryoneInRoom(room.roomInfo.name, 'drawBoard', report.commandData);
                this.sendToEveryoneInRoom(room.roomInfo.name, 'updatePlayerScore', sender);
                this.sendToEveryoneInRoom(sender.socketId, 'drawRack', sender.rack.getLetters());
                this.sendToEveryoneInRoom(room.roomInfo.name, 'lettersBankCountUpdated', room.letterBank.getLettersCount());
                sender.addCommand(report);
                break;
            case CommandVerbs.SWITCH:
                this.sendToEveryoneInRoom(sender.socketId, 'drawRack', sender.rack.getLetters());
                // this.sendToEveryoneInRoom(sender.socketId, 'message', {
                //     text: report.messageToSender,
                //     sender: SYSTEM_NAME,
                //     destination: room.roomInfo.name,
                //     color: MessageSenderColors.SYSTEM,
                // });
                if (!socket) return;

                // socket
                //     .to(room.roomInfo.name)
                //     .emit('message', { text: report.messageToOthers, sender: SYSTEM_NAME, color: MessageSenderColors.SYSTEM });
                sender.addCommand(report);
                break;
            case CommandVerbs.SKIP:
                sender.addCommand(report);
                break;
            case CommandVerbs.BANK:
                // this.sendToEveryoneInRoom(sender.socketId, 'message', {
                //     text: report.messageToSender,
                //     sender: SYSTEM_NAME,
                //     destination: room.roomInfo.name,
                //     color: MessageSenderColors.SYSTEM,
                // });
                break;

            // case CommandVerbs.HINT:
            //     this.sendToEveryoneInRoom(sender.socketId, 'message', {
            //         text: report.messageToSender,
            //         sender: SYSTEM_NAME,
            //         color: MessageSenderColors.SYSTEM,
            //     });
            //     break;
            // case CommandVerbs.HELP:
            //     this.sendToEveryoneInRoom(sender.socketId, 'message', {
            //         text: report.messageToSender,
            //         sender: SYSTEM_NAME,
            //         color: MessageSenderColors.SYSTEM,
            //     });
            //     break;
        }
        // if (report.message) {
        //     // const systemMessage: ChatMessage = {
        //     //     text: report.message,
        //     //     sender: SYSTEM_NAME,
        //     //     destination: room.roomInfo.name,
        //     //     color: MessageSenderColors.SYSTEM,
        //     // };
        //     // this.sendToEveryoneInRoom(room.roomInfo.name, 'message', systemMessage);
        // }
        this.drawRacks(room.roomInfo.name);
        if (room.roomInfo.gameType !== 'log2990') return;
        this.sendToEveryoneInRoom(room.roomInfo.name, 'goalsUpdated', room.getAllGoals());
        // this.communicateNewAchievements(room.roomInfo.name, room.getReachedGoals());
    }

    handleReconnect(socket: io.Socket, playerData: PlayerData) {
        if (!playerData.roomName) return;
        const room = this.roomService.getRoom(playerData.roomName);
        if (!room) return;
        const player = room.getPlayer(playerData.socketId);
        if (!player) return;

        player.socketId = socket.id;
        this.socketJoin(socket, playerData.roomName);
        this.socketEmit(socket, 'reconnected', { room, player });
    }
    drawRacks(roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const racks: string[][] = [];
        for (const player of room.players) {
            racks.push(player.rack.getLetters().split(''));
        }
        this.sendToEveryoneInRoom(room.roomInfo.name, 'drawRacks', racks);
    }

    getSocketRoom(socket: io.Socket): string | undefined {
        for (const room of socket.rooms) {
            if (room.startsWith(DEFAULT_ROOM_NAME)) return room;
        }
        return;
    }

    // displayGameResume(room: Room) {
    //     if (!room.verifyBothPlayersExist()) return;
    //     if (!room.letterBank) return;
    //     let message = '';
    //     try {
    //         message = `
    //             Fin de partie - ${room.letterBank.convertAvailableLettersBankToString()} \n
    //             ${room.players[0].username}: ${room.players[0].rack.getLetters()} \n
    //             ${room.players[1].username}: ${room.players[1].rack.getLetters()}
    //         `;
    //     } catch (e) {
    //         message = `
    //         Fin de partie - ${room.letterBank.convertAvailableLettersBankToString()} \n
    //         ${room.players[0].username}: ${room.players[0].rack.getLetters()} \n
    //     `;
    //     }
    //     // const chatMessage: ChatMessage = {
    //     //     text: message,
    //     //     sender: SYSTEM_NAME,
    //     //     destination: room.roomInfo.name,
    //     //     color: MessageSenderColors.SYSTEM,
    //     // };
    //     // this.sendToEveryoneInRoom(room.roomInfo.name, 'message', chatMessage);
    // }
    updatePlayersScore(room: Room) {
        for (const player of room.players) {
            if (!player || !player.rack || !room.letterBank) {
                continue;
            }
            this.sendToEveryoneInRoom(room.roomInfo.name, 'updatePlayerScore', player);
        }
    }

    // updateLeaderboard(room: Room) {
    //     const isoDate = this.dateService.getCurrentDate();
    //     for (const player of room.players) {
    //         if (!player || room.bot === player) continue;
    //         const score: Score = {
    //             author: player.username,
    //             points: player.points,
    //             gameType: room.roomInfo.gameType,
    //             dictionary: room.roomInfo.dictionary,
    //             date: isoDate,
    //         };
    //         // this.scoreService.updateBestScore(score);
    //     }
    // }
    protected async updateGame(room: Room) {
        const game: Game = {
            date: room.startDate.toUTCString(),
            period: this.dateService.convertToString(this.dateService.getGamePeriod(room.startDate, new Date())),
            player1: room.players[0].username,
            scorePlayer1: room.players[0].points,
            player2: room.players[1].username,
            scorePlayer2: room.players[1].points,
            gameType: room.roomInfo.gameType,
            surrender: room.roomInfo.surrender,
        };
        await this.gamesHistoryService.updateGame(game.date, game);
    }

    protected removeUsersInGame(players: Player[]) {
        console.log('InGameUsers before remove: ', this.userService.usersInGame.value);
        const users = this.userService.usersInGame.value;
        for (let i = 0; i < players.length; i++) {
            const index = users.indexOf(players[i].username, 0);
            if (index > -1) {
                users.splice(index, 1);
            }
        }
        this.userService.usersInGame.next(users);
        console.log('InGameUsers before after: ', this.userService.usersInGame.value);
    }
    protected addOneUserInGame(players: Player) {
        const users = this.userService.usersInGame.value;
        users.push(players.username);
        this.userService.usersInGame.next(users);
    }

    protected removeOneUserInGame(players: Player) {
        const users = this.userService.usersInGame.value;
        const index = users.indexOf(players.username, 0);
        if (index > -1) {
            users.splice(index, 1);
        }
        this.userService.usersInGame.next(users);
    }

    protected addUsersInGame(players: Player[]) {
        const users = [];
        for (let i = 0; i < players.length; i++) {
            users.push(players[i].username);
        }
        this.userService.usersInGame.next(users);
    }

    protected handleGamePassFinish(room: Room) {
        if (!room) return;
        room.setPlayersTurnToFalse();
        room.updateScoreOnPassFinish();
        this.updatePlayersScore(room);
        this.removeUsersInGame(room.players);
        // this.updateLeaderboard(room);
        this.updateGame(room);
        room.elapsedTime = END_TIMER_VALUE; // to clear the interval

        
        if (!room.isGameSavedOnDB) {
            const date = DateService.getParsableTimestamp();
            const winners = room.getWinner();
            room.players.forEach((player: Player) => {
                if (player.pseudo.startsWith('bot ')) {
                    return;
                }
                if (player.isGameSavedOnDB) return;
                if (player.isObserver) return;
                const endType: string = winners.includes(player) ? 'V' : 'D';
                this.userService.saveGamePlayed(player, endType, date);
                player.isGameSavedOnDB =true;
            });
            room.isGameSavedOnDB = true;
        }    
        console.log(`Winners of the game ${room.getWinner()}`);
        this.sendToEveryoneInRoom(room.roomInfo.name, 'gameIsOver', room.getWinner());
        // this.displayGameResume(room);
        this.roomService.setUnavailable(room.roomInfo.name);
        this.roomService.removeRoom(room.roomInfo.name);
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
    }

    // private communicateNewAchievements(roomName: string, goalsReached: ReachedGoal[]) {
    //     goalsReached.forEach((goal) => {
    //         if (goal.communicated) return;
    //         // const goalMessage: ChatMessage = {
    //         //     text: `${goal.playerName} a atteint l'objectif: \n ${goal.title} \n \n Récompense: ${goal.reward} points!!!`,
    //         //     sender: SYSTEM_NAME,
    //         //     destination: roomName,
    //         //     color: MessageSenderColors.GOALS,
    //         // };
    //         // this.sendToEveryoneInRoom(roomName, 'message', goalMessage);
    //         goal.communicated = true;
    //     });
    // }
}
/* eslint-disable */
