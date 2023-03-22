export interface RoomInfo {
    name: string;
    timerPerTurn: string;
    dictionary: string;
    gameType: string;
    maxPlayers: number;
    isSolo?: boolean;
    surrender: string;
    nbHumans: number;
    pw: string;
    isPublic: boolean;
}
