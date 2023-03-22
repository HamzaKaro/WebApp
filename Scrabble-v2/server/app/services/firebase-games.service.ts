/* eslint-disable */
import 'reflect-metadata';
// import { Service } from 'typedi';
// Import the functions you need from the SDKs you need
// import { User } from '@app/interfaces/user';
// import { child, get, ref, set } from 'firebase/database';
// import { collection, doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { Firebase } from '@app/services/firebase.service';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { v4 as uuidv4 } from 'uuid';

export interface GameDocument {
    playersEmail: string[]; // Array of all the people that participated in the game
    startTime: string;
    gameDuration: number; // in ms
}
export interface PlayerGameDocument {
    score: number;
    joinTime: string;
    endType: string; // Enum with those values : Draw, Defeat, Victory, Abandon
    gameDuration: number; // in ms
}

export interface DbGameOperationResult {
    message: string;
    gameUid?: string;
}

const GAMES_PLAYED_COLLECTION = 'games';
export class FirebaseGamesService {
    constructor(private firebase: Firebase) {}
    // async getGameDocument(gameUID: string): Promise<GameDocument> {
    //     const db = collection(this.firebase.dbStore(), GAMES_PLAYED_COLLECTION);
    //     const document = doc(db, gameUID);
    //     const game = (await (await getDoc(document)).data()) as GameDocument;
    //     return game;
    // }

    async getPlayerGameReport(gameUID: string): Promise<PlayerGameDocument | undefined> {
        const db = collection(this.firebase.dbStore(), GAMES_PLAYED_COLLECTION);
        const document = doc(db, gameUID);
        const game = (await (await getDoc(document)).data()) as PlayerGameDocument;
        return game;
    }

    // TODO remove
    // async getPlayerGameDocument(gameUID: string, email: string): Promise<PlayerGameDocument | undefined> {
    //     const game: GameDocument = await this.getGameDocument(gameUID);
    //     if (!game) {
    //         console.log('This game does not exist');
    //         return undefined;
    //     }
    //     if (!game.playersEmail || !game.playersEmail.includes(email)) return undefined;
    //     const collectionRef = collection(this.firebase.dbStore(), GAMES_PLAYED_COLLECTION);
    //     const document = doc(collectionRef, `${gameUID}/${email}/partie`);
    //     const playerGameReport = (await (await getDoc(document)).data()) as PlayerGameDocument;
    //     return playerGameReport;
    // }
    // games/{gameUid}
    async createGameDocument(document: GameDocument): Promise<DbGameOperationResult> {
        const uuid = uuidv4();
        console.log(`created game with uuid : ${uuid}`);
        let response: string = '';
        const db = this.firebase.dbStore();
        const docs = doc(db, 'games', uuid);
        await setDoc(docs, document)
            .then(() => {
                response = 'success';
            })
            .catch((error) => {
                response = error.code;
            });
        if (response !== 'success') return { message: response };
        return { message: response, gameUid: docs.id };
    }

    // games/{gameUid}/{email}/partie contains a PlayerGameDocument
    // async addPlayerGameDocument(gameUid: string, playerEmail: string, playerGame: PlayerGameDocument): Promise<string> {
    //     const game: GameDocument = await this.getGameDocument(gameUid);
    //     if (!game) return "cette partie n'existe pas";
    //     if (!game.playersEmail) return 'La partie est dans un format invalide';
    //     if (!game.playersEmail.includes(playerEmail)) return "Ce joueur n'était pas dans cette partie";
    //     let response: string = '';
    //     const db = this.firebase.dbStore();
    //     const docs = doc(db, `games/${gameUid}/${playerEmail}/partie`);
    //     await setDoc(docs, playerGame)
    //         .then(() => {
    //             response = 'success';
    //         })
    //         .catch((error) => {
    //             response = error.code;
    //         });
    //     return response;
    // }

    // async createPlayerGameDocumentInAGameDocument(gameUid: string, playerEmail: string, playerGame: PlayerGameDocument): Promise<string> {
    //     const game: GameDocument = await this.getGameDocument(gameUid);
    //     if (!game) return "cette partie n'existe pas";
    //     if (!game.playersEmail) return 'La partie est dans un format invalide';
    //     if (game.playersEmail.includes(playerEmail)) return 'Ce joueur est déjà pas dans cette partie';
    //     let response: string = '';
    //     const db = this.firebase.dbStore();
    //     const docs = doc(db, `games/${gameUid}/${playerEmail}/partie`);
    //     await setDoc(docs, playerGame)
    //         .then(() => {
    //             response = 'success';
    //         })
    //         .catch((error) => {
    //             response = error.code;
    //         });
    //     return response;
    // }

    // Call
    async addPlayerGameDocumentToDB(playerGame: PlayerGameDocument): Promise<DbGameOperationResult> {
        const uuid = uuidv4();
        console.log(`created game with uuid : ${uuid}`);
        let response: string = '';
        const db = this.firebase.dbStore();
        const docs = doc(db, 'games', uuid);
        await setDoc(docs, playerGame)
            .then(() => {
                response = 'success';
            })
            .catch((error) => {
                response = error.code;
            });
        if (response !== 'success') return { message: response };
        return { message: response, gameUid: docs.id };
    }
}
