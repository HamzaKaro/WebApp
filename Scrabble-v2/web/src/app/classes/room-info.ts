export interface RoomInfo {
    name: string;
    timerPerTurn: string;
    dictionary: string;
    gameType: string;
    maxPlayers: number;
    isSolo?: boolean;
    isGameOver?: boolean;
    nbHumans: number;
    isPublic: boolean;
    pw: string;
}
