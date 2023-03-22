import { Score } from '@app/classes/score';
import { collection, CollectionReference, deleteDoc, doc, getDocs, limit, query, where } from 'firebase/firestore/lite';
import 'reflect-metadata';
import { Service } from 'typedi';
import { Firebase } from './firebase.service';

// TODO fix query
const NO_LIMIT = 200;
@Service()
export class ScoresService {
    scoresRef: CollectionReference;
    constructor(private firebase: Firebase) {
        this.scoresRef = collection(this.firebase.dbStore(), 'scores');
    }

    async reinitializeScores() {
        try {
            const db = this.firebase.dbStore();
            await deleteDoc(doc(db, 'scores'));
        } catch (e) {
            console.error('Error while reinitializing scores', e);
        }
    }

    async getAllScores(): Promise<Score[]> {
        try {
            // const q = query(this.scoresRef, orderBy('points', 'desc'), orderBy('date'));
            // const scores = [] as Score[];
            // const querySnapshot = await getDocs(q);
            // // eslint-disable-next-line @typescript-eslint/no-shadow
            // querySnapshot.forEach((doc) => {
            //     // doc.data() is never undefined for query doc snapshots
            //     scores.push(doc.data() as Score);
            // });

            // const channelDoc = doc(this.scoresRef, name);
            // const channelData = (await (await getDoc(channelDoc))?.data()) as Channel;
            const scores = [] as Score[];
            const docs = await getDocs(this.scoresRef);

            docs.forEach((docu) => {
                scores.push(docu.data() as Score);
            });

            return scores;
        } catch (e) {
            console.error('Error while getting all scores', e);
            return [];
        }
    }

    async getBestScoresByGameType(gameType: string, quantity?: number): Promise<Score[]> {
        try {
            if (quantity !== undefined && quantity <= 0) {
                return new Promise<Score[]>((resolve) => {
                    resolve([]);
                });
            }
            const size = quantity === undefined ? NO_LIMIT : quantity;
            const db = collection(this.firebase.dbStore(), 'scores');
            const q = query(db, where('gameType', '==', gameType), limit(size));
            const result = await getDocs(q);
            const scores = [] as Score[];
            // eslint-disable-next-line @typescript-eslint/no-shadow
            result.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                scores.push(doc.data() as Score);
            });
            return scores.sort((a, b) => {
                return b.points - a.points;
            });
        } catch (e) {
            console.error('Error while getting best scores by game type', e);
            return [];
        }
    }
    // async updateBestScore(score: Score) {
    //     try {
    //         // Filter out bots from the scores
    //         if (score.author.startsWith('bot')) return;

    //         const db = this.firebase.dbStore();
    //         const email = await this.userService.getEmail(score.author);
    //         const scores = doc(db, 'scores', email);
    //         await setDoc(
    //             scores,
    //             {
    //                 author: score.author,
    //                 date: score.date,
    //                 dictionary: score.dictionary,
    //                 gameType: score.gameType,
    //                 points: score.points,
    //             },
    //             { merge: true },
    //         );
    //     } catch (e) {
    //         console.error('Error while updating score:', e);
    //     }
    // }
}
