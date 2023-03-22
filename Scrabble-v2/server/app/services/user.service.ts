/* eslint-disable */

import 'reflect-metadata';
import { Service } from 'typedi';
// Import the functions you need from the SDKs you need
import { Player } from '@app/classes/player';
import { RATING_COIN_REWARD } from '@app/constants/rating';
import { Channel } from '@app/interfaces/chat';
import { Achievement, User } from '@app/interfaces/user';
import { Uauth } from '@app/interfaces/user-auth';
import { DbGameOperationResult, FirebaseGamesService, PlayerGameDocument } from '@app/services/firebase-games.service';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { child, get, ref, remove, set } from 'firebase/database';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore/lite';
import { BehaviorSubject } from 'rxjs';
import { Socket } from 'socket.io';
import { DateService } from './date.service';
import { Firebase } from './firebase.service';
export interface Rating {
    totalRating: number;
    nSubmitters: number;
}
// Initialize Firebase
@Service()
export class UserService {
    gamesService: FirebaseGamesService;
    constructor(private firebase: Firebase) {
        this.gamesService = new FirebaseGamesService(this.firebase);
    }
    // TODO: make a service to handle connected users
    activeUsers = [''];
    connectedUsers = new BehaviorSubject<string[]>([]);
    authedSockets = new Map<string, { socket: Socket; email: string }>();
    usersInGame = new BehaviorSubject<string[]>([]);
    isModified = false;
    replaceActiveUser(oldUsername: string, newUsername: string) {
        this.connectedUsers.value.forEach((activeUser, i) => {
            const copy = this.connectedUsers.value;
            if (activeUser === oldUsername) {
                copy[i] = newUsername;
                this.connectedUsers.next(copy);
            }
        });
    }

    async saveGamePlayed(player: Player, endType: string, endTimestamp: string) {
        try {
            console.log(`Saving the game played for : ${player.pseudo}`);
            const playerReport: PlayerGameDocument = {
                score: player.points,
                joinTime: player.startGameTimestamp,
                endType: endType,
                gameDuration: DateService.getParsableTimestampsDifference(player.startGameTimestamp, endTimestamp),
            };
            const dbResult: DbGameOperationResult = await this.gamesService.addPlayerGameDocumentToDB(playerReport);
            const email = await this.getEmail(player.pseudo);
            const user: User = await this.getUser(email);
            if (!user.gamesUidPlayed) {
                // Cette ligne n'a pas l'effet escompté
                user.gamesUidPlayed = [];
            }
            if (!dbResult.gameUid) return;
            user.gamesUidPlayed.push(dbResult.gameUid);
            await this.updateUser(user);
        } catch (error) {
            console.log(error);
        }
    }

    async getUserGames(user: User): Promise<PlayerGameDocument[]> {
        // 1. Look in Firestore for the list of gameIds that a user participated in
        // 2. For each element in the previous list, looks in /games for the games associated with the gameId
        // 3. For each gameId, look for the GameDocument associated with the player
        if (!user.gamesUidPlayed) return [];
        const games: PlayerGameDocument[] = [];
        for (let index = 0; index < user.gamesUidPlayed.length; index++) {
            const playerGameReport = await this.gamesService.getPlayerGameReport(user.gamesUidPlayed[index]);
            if (!playerGameReport) continue;
            console.log(playerGameReport);
            games.push(playerGameReport);
        }
        return games;
    }

    async getRating(): Promise<Rating> {
        const db = collection(this.firebase.dbStore(), 'ratings');
        const document = doc(db, 'average');
        const rating = (await (await getDoc(document)).data()) as Rating;
        return rating;
    }
    async updateRating(user: User, ratingToAdd: number): Promise<string> {
        // Update the user with the new rating
        if (user.rating !== 0) return 'rating already done';
        if (ratingToAdd < 1 || ratingToAdd > 5) return 'le rating doit etre entre 1 et 5';
        user.rating = ratingToAdd;
        const result = await this.updateUser(user);
        if (result !== 'success') return result;

        // Update the rating on the rating collection
        const rating: Rating = await this.getRating();
        rating.nSubmitters += 1;
        rating.totalRating += ratingToAdd;
        const db = collection(this.firebase.dbStore(), 'ratings');
        const document = doc(db, 'average');
        let message = '';
        await setDoc(document, rating)
            .then(() => {
                message = 'success';
            })
            .catch((error) => {
                message = error;
            });
        return message;
    }

    async updateSettings(user: User): Promise<string> {
        const result = await this.updateUser(user);
        return result;
    }

    async getFriends(friendsEmail: string[]): Promise<string[]> {
        const listPseudoPromises = [];
        for (const emailUser of friendsEmail) {
            const friendPromise = this.getUser(emailUser);
            listPseudoPromises.push(friendPromise);
        }
        return await Promise.all(listPseudoPromises).then((value) => value.map((user) => user.username));
        // return listPseudo;
    }

    async getUncontactedFriends(email: string, userChannels: string[], friendsEmail: string[]): Promise<string[]> {
        const uncontactedFriendsPromises = [];
        const channelsRef = collection(this.firebase.dbStore(), 'channels');
        const channelsDocs = await getDocs(channelsRef);
        const channels = (channelsDocs.docs.map((doc) => doc.data()) as Channel[]).filter((channel) => {
            return userChannels.includes(channel.name);
        });

        for (const emailUser of friendsEmail) {
            const isContacted = channels.some((channel) => channel.participants.includes(emailUser));
            if (!isContacted) {
                console.log('!isContacted', emailUser);
                const friendPromise = this.getUser(emailUser);
                uncontactedFriendsPromises.push(friendPromise);
            }
        }
        return await Promise.all(uncontactedFriendsPromises).then((value) => value.map((user) => user.username));
    }

    // Newly add for theme
    async addTheme(user: User, themesPurchased: string[]): Promise<string> {
        let message1 = '';
        await this.addThemeToPreferenceList(user, themesPurchased)
            .then(() => {
                message1 = 'success';
            })
            .catch((error) => {
                message1 = error;
            });
        return message1;
    }

    async updateUserThemeList(email: string, themeToAdd: string): Promise<string> {
        const user: User = await this.getUser(email);
        user.themes.push(themeToAdd);
        // TODO Refactor with update user
        const db = collection(this.firebase.dbStore(), 'users');
        const document = doc(db, user.email);
        let message = '';
        await setDoc(document, user)
            .then(() => {
                message = 'success';
            })
            .catch((error) => {
                message = error;
            });
        return message;
    }

    async addFriend(user: User, usernameToAdd: string): Promise<string> {
        let message1 = '';
        let message2 = '';
        console.log('Email of usernameToAdd:  ' + usernameToAdd);
        try {
            const userToAdd = await this.getUserByUsername(usernameToAdd);
            await this.addFriendToFriendList(user, userToAdd.email)
                .then(() => {
                    message1 = 'success';
                })
                .catch((error) => {
                    message1 = error;
                });
            await this.addFriendToFriendList(userToAdd, user.email)
                .then(() => {
                    message2 = 'success';
                })
                .catch((error) => {
                    message2 = error;
                });
            if (message1 !== 'success') {
                return message1;
            } else if (message2 != 'success') {
                return message2;
            }
            return message1;
        } catch (e) {
            return 'Utilisateur introuvable';
        }
    }

    async removeFriend(user: User, emailToRemove: string): Promise<string> {
        let message1 = '';
        let message2 = '';
        const userToRemove = await this.getUser(emailToRemove);
        await this.removeFriendFromFriendList(user, userToRemove.email)
            .then(() => {
                message1 = 'success';
            })
            .catch((error) => {
                message1 = error;
            });
        await this.removeFriendFromFriendList(userToRemove, user.email)
            .then(() => {
                message2 = 'success';
            })
            .catch((error) => {
                message2 = error;
            });
        if (message1 !== 'success') {
            return message1;
        } else if (message2 != 'success') {
            return message2;
        }
        return message1;
    }
    /********************Methods to handle User accounts************** */
    async getUser(email: string): Promise<User> {
        const db = collection(this.firebase.dbStore(), 'users');
        const document = doc(db, email);
        const user = (await (await getDoc(document)).data()) as User;
        return user;
    }

    async getUserByUsername(username: string): Promise<User> {
        const email = await this.getEmail(username);
        const user = await this.getUser(email);
        return user;
    }

    async updateUser(user: User): Promise<string> {
        const db = collection(this.firebase.dbStore(), 'users');
        const document = doc(db, user.email);
        let message = '';
        await setDoc(document, user)
            .then(() => {
                message = 'success';
            })
            .catch((error) => {
                message = error;
            });
        return message;
    }
    async claimRatingReward(user: User): Promise<string> {
        if (user.receivedRatingReward) return 'success';
        user.receivedRatingReward = true;
        user.coins += RATING_COIN_REWARD;
        const response = await this.updateUser(user);
        return response;
    }

    async updateAvatar(email: string, avatar: string): Promise<string> {
        const user: User = await this.getUser(email);
        user.avatar = avatar;
        const message: string = await this.updateUser(user);
        return message;
    }

    async updateUserCoins(email: string, coinsToAdd: number): Promise<string> {
        const user: User = await this.getUser(email);
        user.coins += coinsToAdd;
        // TODO Refactor with update user
        const db = collection(this.firebase.dbStore(), 'users');
        const document = doc(db, user.email);
        let message = '';
        await setDoc(document, user)
            .then(() => {
                message = 'success';
            })
            .catch((error) => {
                message = error;
            });
        return message;
    }

    /** ************************authentification*********************** */

    async isAuthorized(user: Uauth): Promise<boolean> {
        const auth = this.firebase.auth();
        let response = false;
        await signInWithEmailAndPassword(auth, user.email, user.password)
            .then(() => {
                // Signed in
                response = true;
            })
            .catch((error) => {
                console.log(error.code);
            });
        return response;
    }
    async createUser(user: Uauth) {
        const auth = this.firebase.auth();
        let response;
        await createUserWithEmailAndPassword(auth, user.email, user.password).then(async () => {
            // Signed in
            await this.writeUserData(user.username, user.email, '')
                .then(async () => {
                    const db = this.firebase.dbStore();
                    const docs = doc(db, 'users', user.email);
                    const defaultUser = {
                        id: 0,
                        email: user.email,
                        username: user.username,
                        preferences: {
                            theme: 'light',
                            language: 'fr',
                            visualAnimations: true,
                            soundAnimations: true,
                        },
                        elo: 0,
                        coins: 150,
                        channels: [] as string[],
                        achievements: [] as Achievement[],
                        avatar: user.avatar,
                        friends: [] as string[],
                        rating: 0,
                        receivedRatingReward: false,
                        connexions: [new DateService().getMontrealDatetime()] as string[],
                        deconnexions: [] as string[],
                        themes: [] as string[],
                        gamesUidPlayed: [] as string[],
                    };
                    await setDoc(docs, defaultUser)
                        .then(() => {
                            response = defaultUser;
                        })
                        .catch((error) => {
                            response = error.code;
                        });
                })
                .catch((error) => {
                    console.error(error);
                    response = error.code;
                });
        });
        return response;
    }
    disconnect(username: string): boolean {
        return this.removeConnected(username);
    }
    async isPseudoUnique(username: String): Promise<boolean> {
        const dbRef = this.firebase.dbRef();
        let response = true;
        await get(child(dbRef, `users/${username}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    response = false;
                }
            })
            .catch((error) => {
                console.error(error);
            });
        return response;
    }
    isConnected(username: string): boolean {
        console.log('active users: ' + this.connectedUsers.value);
        console.log('username ' + username);
        console.log('isConnected ' + this.connectedUsers.value.includes(username));
        return this.connectedUsers.value.includes(username);
    }

    async authentifySocket(email: string, socket: Socket) {
        try {
            const user = await this.getUser(email);
            if (user) {
                this.authedSockets.set(user.username, { socket, email });
            }
        } catch (error) {
            console.error(error);
        }
    }

    private removeConnected(username: string): boolean {
        const arr = [];
        for (let user = 0; user < this.connectedUsers.value.length; user++) {
            if (this.connectedUsers.value[user] !== username) {
                arr.push(this.connectedUsers.value[user]);
            }
        }
        if (arr.length === this.connectedUsers.value.length) {
            return false;
        }
        this.connectedUsers.next(arr);
        this.isModified = true;
        return true;
    }

    async getUsername(email: string): Promise<string> {
        const dbRef = this.firebase.dbRef();
        let response = '';
        await get(child(dbRef, 'users'))
            .then((snapshot) => {
                snapshot.forEach((child) => {
                    if (child.child('email').val() === email) {
                        response = child.key as string;
                        return;
                    }
                });
            })
            .catch((error) => {
                console.error(error);
            });
        return response;
    }

    async getEmail(username: string): Promise<string> {
        const dbRef = this.firebase.dbRef();
        const email = await (await get(child(dbRef, 'users/' + username))).child('email').val();
        return email;
    }
    async writeUserData(username: string, email: string, imageUrl: string) {
        const db = this.firebase.db();
        await set(ref(db, 'users/' + username), {
            email,
            profile_picture: imageUrl,
        });
    }
    async removeUserData(username: string) {
        const db = this.firebase.db();
        await remove(ref(db, 'users/' + username));
    }

    private remove(list: string[], elementToRemove: string): string[] {
        list.forEach((value, index) => {
            if (value === elementToRemove) list.splice(index, 1);
        });
        return list;
    }

    private async removeFriendFromFriendList(user: User, emailToRemove: string): Promise<string> {
        let message = '';
        await this.getUser(emailToRemove)
            .then(() => {
                message = 'success';
            })
            .catch((error) => {
                message = error;
            });
        if (message !== 'success') return message;
        const newList = this.remove(user.friends, emailToRemove);
        user.friends = newList;
        await this.updateUser(user);
        return message;
    }

    private async addFriendToFriendList(user: User, emailToAdd: string): Promise<string> {
        let message = '';
        await this.getUser(emailToAdd)
            .then(() => {
                message = 'success';
            })
            .catch((error) => {
                message = error;
            });
        if (message !== 'success') return message;
        if (user.friends.includes(emailToAdd)) throw 'error';
        user.friends.push(emailToAdd);
        await this.updateUser(user);
        return message;
    }

    // Newly add for theme
    private async addThemeToPreferenceList(user: User, themesPurchased: string[]): Promise<string> {
        let message = '';
        console.log('addThemeToPreferenceList : ', themesPurchased);
        try {
            themesPurchased.forEach((value) => {
                if (!user.themes.includes(value)) user.themes.push(value);
            });
        } catch (e) {
            console.log(e);
        }
        await this.updateUser(user);
        return message;
    }
}
