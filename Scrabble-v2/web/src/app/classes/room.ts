import { Injectable } from '@angular/core';
import { Player } from './player';
import { RoomInfo } from './room-info';

@Injectable({
    providedIn: 'root',
})
export class Room {
    nbHumanPlayers: number;
    nbBots: number;
    elapsedTime: number;
    currentPlayerPseudo: string;
    players: Player[];
    roomInfo: RoomInfo;
    isBankUsable: boolean;
    isGameStarted: boolean;
    racks: string[][];

    constructor() {
        this.nbHumanPlayers = 1;
        this.nbBots = 0;
        this.roomInfo = { name: '', timerPerTurn: '', dictionary: '', gameType: '', maxPlayers: 2, nbHumans: 2, isPublic: true, pw: '' };
        this.players = [];
        this.isBankUsable = true;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        for (let i = 0; i < 4; i++) {
            this.players.push(new Player());
        }
    }

    addPlayer(player: Player) {
        if (this.players.length < this.roomInfo.maxPlayers) {
            this.players.push(player);
        }
    }

    removePlayer(playerSocketId: string) {
        const playerToRemove = this.players.find((element) => element.socketId === playerSocketId);
        if (playerToRemove) {
            this.players.splice(this.players.indexOf(playerToRemove), 1);
        }
    }
}
