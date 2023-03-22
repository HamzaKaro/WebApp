import { BoardMessage } from '@app/classes/board-model/board-message';
import { Goal } from '@app/classes/goals/goal';
import { LetterBank } from '@app/classes/letter-bank/letter-bank';
import { Player } from '@app/classes/player';
import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { DEFAULT_DICTIONARY_TITLE } from '@app/constants/constants';
import { BotGreeting } from '@app/enums/bot-greetings';
import { GameLevel } from '@app/enums/game-level';
import { PlacementData } from '@app/interfaces/placement-data';
import { ReachedGoal } from '@app/interfaces/reached-goal';
import { RoomInfo } from '@app/interfaces/room-info';
import { DateService } from '@app/services/date.service';
import { DictionariesFileService } from '@app/services/dictionaries-files.service';
// eslint-disable-next-line no-restricted-imports
import { BoardNode } from '../board-model/nodes/board-node';
import { GameManager } from './game-manager';

const MAX_PLAYERS = 4;
export class Room {
    startTimestamp: string; // When the players see the page with the board
    gameUID: string; // UID that can be seen on the database
    isGameSavedOnDB: boolean;
    nbHumanPlayers: number;
    nbBots: number;
    botsCount: number;
    timer: number;
    isGameOver: boolean;
    elapsedTime: number;
    players: Player[];
    roomInfo: RoomInfo;
    bot: VirtualPlayer;
    startDate: Date;
    isGameStarted: boolean;
    private isFirstGame: boolean;
    private gameManager: GameManager;
    constructor(clientRoom?: Room) {
        this.startTimestamp = DateService.getParsableTimestamp(); // When the game starts, this attribute is overwritten
        this.isGameSavedOnDB = false;
        this.gameUID = '';
        this.isGameStarted = false;
        this.players = [];
        this.elapsedTime = 0;
        this.startDate = new Date();
        this.isGameOver = false;
        this.botsCount = 1;
        this.roomInfo = {
            name: '',
            timerPerTurn: '',
            dictionary: DEFAULT_DICTIONARY_TITLE,
            gameType: '',
            maxPlayers: 2,
            surrender: '',
            nbHumans: 2,
            isPublic: true,
            pw: '',
        };
        this.nbBots = 4;
        this.nbHumanPlayers = 0;
        if (clientRoom) {
            this.isGameStarted = clientRoom.isGameStarted;
            this.roomInfo = {
                name: '',
                timerPerTurn: clientRoom.roomInfo.timerPerTurn,
                dictionary: clientRoom.roomInfo.dictionary,
                gameType: clientRoom.roomInfo.gameType,
                nbHumans: clientRoom.roomInfo.nbHumans,
                maxPlayers: 2,
                surrender: '',
                isPublic: clientRoom.roomInfo.isPublic,
                pw: clientRoom.roomInfo.pw,
            };
        } else
            this.roomInfo = {
                name: '',
                timerPerTurn: '',
                dictionary: DEFAULT_DICTIONARY_TITLE,
                gameType: '',
                maxPlayers: 2,
                surrender: '',
                nbHumans: 2,
                isPublic: true,
                pw: '',
            };
        this.gameManager = new GameManager(
            new DictionariesFileService().convertTitleIntoFilename(this.roomInfo.dictionary),
            this.roomInfo.gameType === 'log2990',
        );
        this.isFirstGame = true;
    }

    get turnPassedCounter(): number {
        return this.gameManager.turnPassedCounter;
    }

    get placementFinder(): PlacementFinder {
        return this.gameManager.placementFinder;
    }

    get maxPlayers(): number {
        return this.roomInfo.maxPlayers;
    }

    get isSolo(): boolean | undefined {
        return this.roomInfo.isSolo;
    }

    getBoard(): string[] {
        // TODO: modifier ok pour *
        const table: BoardNode[] = this.gameManager.boardManipulator.board.table;
        const simplifiedBoard: string[] = [];
        // let columnCounter = 1;
        let rowValue = '';
        // eslint-disable-next-line no-console
        // console.table(table);
        // if (table[0] === null) return [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 1; i < table.length; i++) {
            {
                if (table[i].content === '') rowValue = rowValue + ' ';
                else if (table[i].value === 0) {
                    const letter = table[i].content.toUpperCase();
                    rowValue = rowValue + letter;
                } else {
                    rowValue = rowValue + table[i].content;
                }
                // eslint-disable-next-line no-empty
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                if (i % 15 === 0) {
                    simplifiedBoard.push(rowValue);
                    rowValue = '';
                }
            }
        }
        return simplifiedBoard;
    }

    hasTimer(): boolean {
        return this.gameManager.hasTimeout;
    }

    stopOtherTimerCreation() {
        this.gameManager.hasTimeout = true;
    }
    incrementTurnPassedCounter() {
        this.gameManager.turnPassedCounter++;
    }

    resetTurnPassedCounter() {
        this.gameManager.turnPassedCounter = 0;
    }

    get letterBank(): LetterBank {
        return this.gameManager.managerLetterBank;
    }

    replaceHuman(botName: string, player: Player) {
        try {
            const newBot = this.gameManager.getNewVirtualPlayer(botName, botName, this.gameManager.fetcher, GameLevel.Beginner);
            const playerIndex = this.players.indexOf(player);
            newBot.points = this.players[playerIndex].points;
            newBot.rack = this.players[playerIndex].rack;
            newBot.isItsTurn = this.players[playerIndex].isItsTurn;
            this.players[playerIndex] = newBot;
            this.nbHumanPlayers--;
            this.nbBots++;
            if (player.isItsTurn) this.changePlayerTurn();
        } catch (e) {
            console.error(e);
        }
    }

    addPlayer(player: Player) {
        if (this.players.length < MAX_PLAYERS) {
            this.fillPlayerRack(player);
            this.players.push(player);
        }
        if (this.isFirstGame && this.players.length !== 0) {
            this.isFirstGame = false;
            this.startDate = new Date();
        }
    }
    createPlayerVirtual(socketId: string, name: string, desiredLevel = GameLevel.Beginner): VirtualPlayer {
        this.bot = this.gameManager.getNewVirtualPlayer(socketId, name, this.gameManager.fetcher, desiredLevel);
        this.addPlayer(this.bot);
        return this.bot;
    }

    givesPlayerGoals() {
        this.gameManager.givePlayerGoals(this.players);
    }

    getAllGoals(): Goal[] {
        return this.gameManager.allGoals;
    }
    getReachedGoals(): ReachedGoal[] {
        return this.gameManager.reachedGoals;
    }
    fillPlayerRack(player: Player) {
        this.gameManager.fillPlayerRack(player);
    }

    removePlayer(player: Player) {
        const playerToRemove = this.players.find((element) => element.socketId === player.socketId);
        if (playerToRemove === this.getCurrentPlayerTurn()) this.changePlayerTurn();
        if (playerToRemove) {
            this.players.splice(this.players.indexOf(playerToRemove), 1);
        }
    }
    removePlayers() {
        for (const player of this.players) {
            this.removePlayer(player);
        }
    }

    askPlacement(placement: PlacementData): BoardMessage {
        return this.gameManager.askPlacement(placement, this.getCurrentPlayerTurn());
    }

    getPlayer(playerSocketId: string): Player | undefined {
        return this.players.find((element) => element.socketId === playerSocketId);
    }

    getPlayerName(playerSocketId: string): string | undefined {
        const player = this.getPlayer(playerSocketId);
        if (!player) return;
        return player.username;
    }

    choseRandomTurn() {
        this.gameManager.choseRandomTurn(this.players);
    }

    changePlayerTurn() {
        this.gameManager.changePlayerTurn(this.players);
        this.elapsedTime = 0;
    }

    canChangePlayerTurn(): boolean {
        return this.gameManager.canChangePlayerTurn(this.players);
    }

    getCurrentPlayerTurn(): Player | undefined {
        return this.gameManager.getCurrentPlayerTurn(this.players);
    }

    verifyBothPlayersExist(): boolean {
        return this.gameManager.verifyAllPlayersExist(this.players);
    }

    isGameFinished(): boolean {
        return this.gameManager.isGameFinished(this.players);
    }

    setPlayersTurnToFalse() {
        this.gameManager.setPlayersTurnToFalse(this.players);
    }

    updateScoreOnPassFinish() {
        this.gameManager.updateScoreOnPassFinish(this.players);
    }

    updateScoresOnPlaceFinish(winner: Player) {
        this.gameManager.updateScoresOnPlaceFinish(winner, this.players);
    }

    getWinner(): Player[] {
        return this.gameManager.getWinner(this.players);
    }
    getBotGreeting(): BotGreeting | undefined {
        if (!this.bot) return undefined;
        return this.bot.greeting;
    }
}
