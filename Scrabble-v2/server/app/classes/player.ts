/* eslint-disable */
import { Rack } from '@app/classes/rack';
import { CommandResult } from '@app/interfaces/command-result';
import { Achievement, User } from '@app/interfaces/user';
import { DateService } from '@app/services/date.service';

export class Player implements User {
    pseudo: string;
    startGameTimestamp: string;
    isGameSavedOnDB: boolean;
    constructor(socketId: string, pseudo: string, isCreator: boolean, user?: User) {
        
        this.isGameSavedOnDB = false;
        this.username = pseudo;
        this.pseudo = pseudo;
        this.socketId = socketId;
        this.rack = new Rack('');
        this.isCreator = isCreator;
        this.points = 0;
        this.isItsTurn = false;
        this.lastThreeCommands = new Array<CommandResult>();
        this.startGameTimestamp = DateService.getParsableTimestamp();
    }
    isObserver: boolean;
    socketId: string;
    points: number;
    rack: Rack;
    isCreator: boolean;
    isItsTurn: boolean;
    managerId: number;
    lastThreeCommands?: CommandResult[];
    id: number;
    username: string;
    email: string;
    preferences: { theme: string; language: string; visualAnimations: boolean; soundAnimations: boolean };
    elo: number;
    coins: number;
    items: string[];
    channels: string[];
    achievements: Achievement[];
    avatar: string;
    friends: string[];
    rating: number;
    receivedRatingReward: boolean;
    connexions: string[];
    deconnexions: string[];
    themes: string[];
    gamesUidPlayed: string[];

    replaceRack(rack: Rack) {
        this.rack = rack;
    }
    addCommand(command: CommandResult) {
        if (!this.lastThreeCommands) return;
        this.lastThreeCommands?.splice(0, 0, command);
        if (this.lastThreeCommands?.length > 3) {
            this.lastThreeCommands?.splice(this.lastThreeCommands?.length - 1, 1);
        }
    }
}
