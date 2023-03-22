/* eslint-disable max-lines */
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room-model/room';
import { Timer } from '@app/classes/timer';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { COUNT_PLAYER_TURN, END_TIMER_VALUE, SYSTEM_NAME, THREE_SECONDS_IN_MS } from '@app/constants/constants';
import { FullCommandVerbs } from '@app/enums/full-command-verbs';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { CommandResult } from '@app/interfaces/command-result';
// import { timeStamp } from 'console';
import * as io from 'socket.io';
import { DateService } from './date.service';
import { SocketHandlerService } from './socket-handler.service';

export class SocketGameService extends SocketHandlerService {
    replaceBot(data: { roomName: string; observer: Player; bot: Player }) {
        const room = this.roomService.getRoom(data.roomName);
        if (!room) return;
        const observerPlayer = room.getPlayer(data.observer.socketId);
        if (!observerPlayer) return;
        let playerIndex = 0;
        for (const player of room.players) {
            if (player.pseudo === data.bot.pseudo) {
                const playerToRemove = room.players.find((element) => element.socketId === observerPlayer.socketId);
                if (playerToRemove) {
                    room.players.splice(room.players.indexOf(playerToRemove), 1);
                }
                observerPlayer.isObserver = false;
                observerPlayer.isItsTurn = data.bot.isItsTurn;
                observerPlayer.points = data.bot.points;
                observerPlayer.rack.letters = data.bot.rack.letters;
                observerPlayer.startGameTimestamp = DateService.getParsableTimestamp();
                room.players[playerIndex] = observerPlayer;
            }
            playerIndex++;
        }
        room.nbHumanPlayers++;
        room.nbBots--;
        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
        this.sendToEveryoneInRoom(room.roomInfo.name, 'updateRoom', room);
        this.sendToEveryoneInRoom(room.roomInfo.name, 'drawRacks', this.drawRacks(room.roomInfo.name));
        this.socketEmitTo(observerPlayer.socketId, 'drawRack', observerPlayer.rack.getLetters());
        this.socketEmitTo(observerPlayer.socketId, 'lettersBankCountUpdated', room.letterBank.getLettersCount());
        this.socketEmitTo(observerPlayer.socketId, 'replaceBot');
        const currentTurnPlayer = room.getCurrentPlayerTurn();
        if (!currentTurnPlayer) return;
        this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', currentTurnPlayer.username);
    }

    handleGetPlayerInfo(socket: io.Socket, roomName: string) {
        this.updatePlayerView(socket, roomName);
    }

    handleGetRackInfo(socket: io.Socket, roomName: string) {
        if (!this.isRoomAndPlayerValid(socket, roomName)) return;
        const player = (this.roomService.getRoom(roomName) as Room).getPlayer(socket.id) as Player;
        this.socketEmit(socket, 'drawRack', player.rack.getLetters());
    }
    fetchBoard(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const board = room.getBoard();
        this.socketEmitTo(socket.id, 'fetchBoard', board);
    }
    handleGetAllGoals(socket: io.Socket) {
        if (!this.isRoomValid(socket)) return;
        const roomName = this.getSocketRoom(socket) as string;
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const goals = room.getAllGoals();
        this.sendToEveryoneInRoom(roomName, 'goalsUpdated', goals);
    }

    async handleCommand(socket: io.Socket, message: string) {
        this.chatMessageService.restore();
        this.sendToEveryoneInRoom(socket.id, 'messageReceived');
        const roomName = this.getSocketRoom(socket) as string;
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const isCommand = this.commandController.hasCommandSyntax(message);
        if (!isCommand) {
            // const chatMessage = this.convertToChatMessage(room, socket.id, message);
            // this.socketEmitRoom(socket, room.roomInfo.name, 'message', chatMessage);
            return;
        }
        const commandSender = room.getPlayer(socket.id) as Player;
        const executionResult: CommandResult = this.commandController.executeCommand(message, room, commandSender) as CommandResult;
        if (this.chatMessageService.isError) {
            this.chatMessageService.message.sender = SYSTEM_NAME;
            this.chatMessageService.message.color = MessageSenderColors.SYSTEM;
            this.chatMessageService.message.destination = room.roomInfo.name;
            // this.sendToEveryoneInRoom(socket.id, 'message', this.chatMessageService.message);
            return;
        }
        if (room.turnPassedCounter >= COUNT_PLAYER_TURN) {
            this.handleGamePassFinish(room);
            return;
        }
        this.notifyViewBasedOnCommandResult(executionResult, room, commandSender, socket);
        if (room.isGameFinished()) {
            this.handleGamePlaceFinish(room, socket.id);
        }
        let currentTurnPlayer = room.getCurrentPlayerTurn();
        if (!currentTurnPlayer) return;
        this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', currentTurnPlayer.username);
        while (currentTurnPlayer.username.startsWith('bot ')) {
            await this.playBotMove(currentTurnPlayer as VirtualPlayer, room, socket);
            currentTurnPlayer = room.getCurrentPlayerTurn();
            if (room.turnPassedCounter >= COUNT_PLAYER_TURN) {
                this.handleGamePassFinish(room);
                return;
            }
            if (!currentTurnPlayer) return;
            this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', currentTurnPlayer.username);
        }
    }
    handleStartGame(socket: io.Socket) {
        // TODO (mathieu): Add the user to the chat room when he joins the waiting room
        // TODO (mathieu): Removes user from the chat room in all appropriate events
        const roomName = this.getSocketRoom(socket);
        if (!roomName) return;
        const room = this.roomService.getRoom(roomName) as Room;
        if (!room) return;
        this.addUsersInGame(room.players);
        if (!room.isGameStarted) room.choseRandomTurn();
        room.isGameStarted = true;
        const currentTurnPlayer = room.getCurrentPlayerTurn();
        if (!currentTurnPlayer) return;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const player = room.getPlayer(socket.id);
        if (!player) return;
        const date = DateService.getParsableTimestamp();
        for (const playerInRoom of room.players) {
            playerInRoom.startGameTimestamp = date;
            this.socketEmit(socket, 'updatePlayerScore', playerInRoom);
        }
        this.socketEmit(socket, 'updateRoom', room);
        this.sendToEveryoneInRoom(roomName, 'playerTurnChanged', currentTurnPlayer.username);
        this.socketEmit(socket, 'lettersBankCountUpdated', room.letterBank.getLettersCount());
        this.socketEmit(socket, 'drawRack', player.rack.getLetters());

        this.sendToEveryone('updateAvailableRoom', this.roomService.getRoomsAvailable());
        if (room.hasTimer()) return;
        room.elapsedTime = 0;
        try {
            if (!room.roomInfo.isPublic) this.roomService.setUnavailable(roomName);
            // eslint-disable-next-line no-empty
        } catch (error) {}
        // const botGreeting = room.getBotGreeting();
        // if (botGreeting) this.handleBotGreeting(room.bot.username, botGreeting, roomName);
    }

    removePlayerFromGameChannel(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        if (!socket.rooms.has(roomName)) return;
        socket.emit('leave-channel', { code: 200, name: roomName, message: 'Successfully gave up and left game.' });
        socket.leave(roomName);
    }

    handleChangeTurn(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        this.changeTurn(room);
    }

    async handleBotPlayAction(socket: io.Socket) {
        const roomName = this.getSocketRoom(socket) as string;
        const room = this.roomService.getRoom(roomName);
        if (!room) {
            this.sendToEveryoneInRoom(roomName, 'botPlayedAction', FullCommandVerbs.SKIP);
            return;
        }

        await Timer.wait(THREE_SECONDS_IN_MS);
        const message = await room.bot.playTurn();
        this.sendToEveryoneInRoom(roomName, 'botPlayedAction', message);
        // this.socketEmitRoom(socket, roomName, 'message', {
        //     text: message,
        //     sender: room.bot.username,
        //     destination: room.roomInfo.name,
        //     color: MessageSenderColors.PLAYER2,
        // });
    }

    // setTimer(room: Room) {
    //     if (!room) return;
    //     room.stopOtherTimerCreation();
    //     const timerInterval = setInterval(async () => {
    //         console.error('room.roomInfo.name');
    //         if (room.isGameOver || room.elapsedTime < 0) {
    //             clearInterval(timerInterval);
    //             return;
    //         }
    //         ++room.elapsedTime;
    //         if (room.elapsedTime >= +room.roomInfo.timerPerTurn) {
    //             const currentPlayer = room.getCurrentPlayerTurn();
    //             if (!currentPlayer) return;
    //             this.sendToEveryoneInRoom(currentPlayer.socketId, 'message', {
    //                 text: `${currentPlayer.username}  a passé son tour.`,
    //                 sender: SYSTEM_NAME,
    //                 destination: room.roomInfo.name,
    //                 color: MessageSenderColors.PLAYER1,
    //             });
    //             const otherPlayer = room.players.find((playerInRoom) => playerInRoom !== currentPlayer);
    //             if (!otherPlayer) return;
    //             this.sendToEveryoneInRoom(otherPlayer.socketId, 'message', {
    //                 text: `${currentPlayer.username} a passé son tour.`,
    //                 sender: SYSTEM_NAME,
    //                 destination: room.roomInfo.name,
    //                 color: MessageSenderColors.SYSTEM,
    //             });
    //             this.changeTurn(room);
    //             let currentTurnPlayer = room.getCurrentPlayerTurn();
    //             if (!currentTurnPlayer) return;
    //             while (currentTurnPlayer.username.startsWith('bot')) {
    //                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //                 await this.playBotMove(currentTurnPlayer as VirtualPlayer, room, null as any);
    //                 currentTurnPlayer = room.getCurrentPlayerTurn();
    //                 if (!currentTurnPlayer) return;
    //                 this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', currentTurnPlayer.username);
    //             }
    //         } else {
    //             this.sendToEveryoneInRoom(room.roomInfo.name, 'timeUpdated', Math.max(+room.roomInfo.timerPerTurn - room.elapsedTime, 0));
    //         }
    //     }, ONE_SECOND_IN_MS);
    //     this.timers.set(room.roomInfo.name, timerInterval);
    //     // room.timerId = timerInterval;
    // }

    // changeTurn(room: Room) {
    //     if (!room) return;
    //     room.elapsedTime = 0;
    //     room.incrementTurnPassedCounter();
    //     if (!room.canChangePlayerTurn()) {
    //         this.handleGamePassFinish(room);
    //         return;
    //     }
    //     room.changePlayerTurn();

    //     const currentTurnPlayer = room.getCurrentPlayerTurn();
    //     if (!currentTurnPlayer) return;
    //     this.sendToEveryoneInRoom(room.roomInfo.name, 'playerTurnChanged', currentTurnPlayer.username);
    //     return;
    // }

    // private handleBotGreeting(name: string, greeting: string, roomName: string) {
    //     const chatMessage: ChatMessage = { sender: name, text: greeting, destination: roomName, color: MessageSenderColors.PLAYER2 };
    //     this.sendToEveryoneInRoom(roomName, 'message', chatMessage);
    // }

    private isRoomAndPlayerValid(socket: io.Socket, roomName: string): boolean {
        const room = this.roomService.getRoom(roomName);
        if (!room) return false;
        if (!room.getPlayer(socket.id)) return false;
        return true;
    }

    private isRoomValid(socket: io.Socket): boolean {
        if (!this.getSocketRoom(socket)) return false;
        if (!this.roomService.getRoom(this.getSocketRoom(socket) as string)) return false;
        return true;
    }
    private handleGamePlaceFinish(room: Room, socketId: string) {
        if (!room) return;
        room.setPlayersTurnToFalse();

        const winners = room.getWinner();
        if (!winners) return;
        const serverPlayer = room.getPlayer(socketId);
        if (!serverPlayer) return;
        room.updateScoresOnPlaceFinish(serverPlayer);
        this.updatePlayersScore(room);
        room.elapsedTime = END_TIMER_VALUE; // to clear the interval
        this.updateGame(room);
        this.sendToEveryoneInRoom(room.roomInfo.name, 'gameIsOver', winners);
        // eslint-disable-next-line no-console
        console.log('==========================================');
        if (!room.isGameSavedOnDB) {
            const date = DateService.getParsableTimestamp();
            room.players.forEach((player: Player) => {
                if (player.pseudo.startsWith('bot ')) {
                    return;
                }
                if (player.isGameSavedOnDB) return;
                if (player.isObserver) return;
                const endType: string = winners.includes(player) ? 'V' : 'D';
                this.userService.saveGamePlayed(player, endType, date);
                player.isGameSavedOnDB = true;
            });
            room.isGameSavedOnDB = true;
        }
        // eslint-disable-next-line no-console
        console.log('==========================================');
    }

    // startTimestamp : the timestamp of when the game started (when the player saw the board)
    // emailOfPlayers: the email of all the players that participated in the game

    private updatePlayerView(socket: io.Socket, roomName: string) {
        const room = this.roomService.getRoom(roomName);
        if (!room) return;
        const player = room.getPlayer(socket.id);
        if (!player) return;

        this.socketEmit(socket, 'updatePlayerScore', player);
        this.socketEmit(socket, 'lettersBankCountUpdated', room.letterBank.getLettersCount());

        const currentPlayerTurn = room.getCurrentPlayerTurn();
        if (!currentPlayerTurn) return;
        this.socketEmit(socket, 'playerTurnChanged', currentPlayerTurn.username);
    }

    // private handleGamePassFinish(room: Room) {
    //     if (!room) return;
    //     room.setPlayersTurnToFalse();
    //     room.updateScoreOnPassFinish();
    //     this.updatePlayersScore(room);
    //     // this.updateLeaderboard(room);
    //     this.updateGame(room);
    //     room.elapsedTime = END_TIMER_VALUE; // to clear the interval
    //     this.sendToEveryoneInRoom(room.roomInfo.name, 'gameIsOver', room.getWinner());
    //     this.displayGameResume(room);
    // }

    // private updatePlayersScore(room: Room) {
    //     for (const player of room.players) {
    //         if (!player || !player.rack || !room.letterBank) {
    //             continue;
    //         }
    //         this.sendToEveryoneInRoom(room.roomInfo.name, 'updatePlayerScore', player);
    //     }
    // }

    // private convertToChatMessage(room: Room, socketId: string, message: string): ChatMessage {
    //     const chatMessage: ChatMessage = {
    //         text: message,
    //         sender: room.getPlayerName(socketId) as string,
    //         destination: room.roomInfo.name,
    //         color: MessageSenderColors.PLAYER2,
    //     };
    //     return chatMessage;
    // }
}
