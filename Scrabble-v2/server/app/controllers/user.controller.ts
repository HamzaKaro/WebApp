/* eslint-disable max-lines */
import { User } from '@app/interfaces/user';
import { Uauth } from '@app/interfaces/user-auth';
import { DateService } from '@app/services/date.service';
import { PlayerGameDocument } from '@app/services/firebase-games.service';
import { Rating, UserService } from '@app/services/user.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

export const DEFAULT_BOT_NAME = 'BOT A';
@Service()
export class UserController {
    router: Router;

    constructor(private userService: UserService) {
        this.configureRouter();
    }

    private configureRouter() {
        this.router = Router();
        this.router.post('/login', async (req: Request, res: Response) => {
            try {
                const body = req.body as Uauth;
                const result = await this.userService.isAuthorized(body);
                if (result) {
                    const user: User = await this.userService.getUser(body.email);
                    const isconnected = this.userService.isConnected(user.username);
                    if (!isconnected) {
                        user.connexions.push(new DateService().getMontrealDatetime());
                        const updateResult = await this.userService.updateUser(user);
                        if (updateResult !== 'success') {
                            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
                            return;
                        }
                        this.userService.connectedUsers.next([...this.userService.connectedUsers.value, user.username]);
                        res.status(StatusCodes.ACCEPTED).send(user);
                    } else {
                        res.status(StatusCodes.CONFLICT).send();
                    }
                } else {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
            // eslint-disable-next-line no-console
            console.log(this.userService.activeUsers);
        });
        this.router.post('/logout', async (req: Request, res: Response) => {
            // TODO we might want to modify the disconect method (email param)
            // user.connexions.push(new DateService().getTimestamp());
            try {
                const body = req.body;
                if (!body || !body.username) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
                const result = this.userService.disconnect(body.username);
                if (result) {
                    const email = await this.userService.getEmail(body.username);
                    const user = await this.userService.getUser(email);
                    user.deconnexions.push(new DateService().getMontrealDatetime());
                    const updateResult = await this.userService.updateUser(user);
                    if (updateResult !== 'success') {
                        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
                        return;
                    }
                    res.status(StatusCodes.ACCEPTED).send();
                } else {
                    res.status(StatusCodes.EXPECTATION_FAILED).send();
                }
            } catch (error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
            }
            // eslint-disable-next-line no-console
            console.log(this.userService.activeUsers);
        });
        this.router.post('/create', async (req: Request, res: Response) => {
            try {
                const body = req.body as Uauth;
                if (await this.userService.isPseudoUnique(body.username)) {
                    const result = await this.userService.createUser(req.body as Uauth);
                    if (typeof result !== 'string') {
                        this.userService.activeUsers.push(body.username);
                        this.userService.connectedUsers.next([...this.userService.connectedUsers.value, body.username]);
                        res.status(StatusCodes.CREATED).send(result);
                    } else {
                        res.status(StatusCodes.EXPECTATION_FAILED).send(result);
                    }
                } else {
                    res.status(StatusCodes.CONFLICT).send();
                }
            } catch (error) {
                res.status(StatusCodes.BAD_REQUEST).send(error);
            }
        });

        this.router.patch('/add-coins', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.email || !body.coins) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
                const user = await this.userService.getUser(body.email);
                const isconnected = this.userService.isConnected(user.username);
                if (!isconnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                } else {
                    const result: string = await this.userService.updateUserCoins(body.email, JSON.parse(body.coins));
                    if (result === 'success') {
                        res.status(StatusCodes.OK).send();
                        return;
                    } else {
                        res.status(StatusCodes.EXPECTATION_FAILED).send();
                        return;
                    }
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.patch('/update-ratings', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.rating || !body.email) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }

                const user = await this.userService.getUser(body.email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                }
                const result: string = await this.userService.updateRating(user, JSON.parse(body.rating));

                if (result === 'success') {
                    res.status(StatusCodes.OK).send();
                    return;
                } else {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.get('/ratings-average', async (req: Request, res: Response) => {
            try {
                const rating: Rating = await this.userService.getRating();
                if (!rating) {
                    res.status(StatusCodes.EXPECTATION_FAILED).send();
                    return;
                }
                if (rating.nSubmitters > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    const average = Math.round((rating.totalRating / rating.nSubmitters) * 100) / 100;
                    res.status(StatusCodes.OK).json({ average });
                } else {
                    res.status(StatusCodes.OK).json({ average: 5 });
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.patch('/claim-rating-reward', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.email) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }

                const user = await this.userService.getUser(body.email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                }
                const result: string = await this.userService.claimRatingReward(user);
                if (result === 'success') {
                    res.status(StatusCodes.OK).send();
                    return;
                } else {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.post('/is-connected', async (req: Request, res: Response) => {
            try {
                const body = req.body as string;
                const isconnected = this.userService.isConnected(body);
                res.status(StatusCodes.OK).send(isconnected);
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
            // eslint-disable-next-line no-console
            console.log(this.userService.activeUsers);
        });

        this.router.get('/get-active-users', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).send(this.userService.connectedUsers.value);
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.get('/get-users-in-game', async (req: Request, res: Response) => {
            try {
                res.status(StatusCodes.OK).send(this.userService.usersInGame.value);
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.get('/get-user', async (req: Request, res: Response) => {
            try {
                const email = req.query.email;
                if (!email || typeof email !== 'string') {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
                const user = await this.userService.getUser(email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                } else {
                    if (user !== undefined) {
                        res.status(StatusCodes.OK).send(user);
                        return;
                    } else {
                        res.status(StatusCodes.EXPECTATION_FAILED).send();
                        return;
                    }
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });
        // Newly add for theme
        this.router.patch('/add-theme', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.email || !body.themeToAdd) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
                const user = await this.userService.getUser(body.email);
                const isconnected = this.userService.isConnected(user.username);
                if (!isconnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                } else {
                    const themeToAdd = body.themeToAdd;
                    // eslint-disable-next-line no-console
                    console.log('themees :', themeToAdd);
                    const result: string = await this.userService.addTheme(user, JSON.parse(themeToAdd));
                    if (result === 'success') {
                        res.status(StatusCodes.OK).send();
                        return;
                    } else {
                        res.status(StatusCodes.EXPECTATION_FAILED).send();
                        return;
                    }
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.get('/get-friends', async (req: Request, res: Response) => {
            try {
                const email = req.query.email;
                if (!email || typeof email !== 'string') {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
                const user = await this.userService.getUser(email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                } else {
                    const friends: string[] = await this.userService.getFriends(user.friends);
                    if (friends.length === user.friends.length) {
                        res.status(StatusCodes.OK).send(friends);
                        return;
                    } else {
                        res.status(StatusCodes.EXPECTATION_FAILED).send();
                        return;
                    }
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });
        this.router.get('/get-uncontacted-friends', async (req: Request, res: Response) => {
            try {
                const email = req.query.email;
                if (!email || typeof email !== 'string') {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
                const user = await this.userService.getUser(email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                } else {
                    const friends: string[] = await this.userService.getUncontactedFriends(email, user.channels, user.friends);
                    res.status(StatusCodes.OK).send(friends);
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.patch('/add-friend', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.email || !body.usernameToAdd) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }

                const user = await this.userService.getUser(body.email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                }
                const usernameToAdd = body.usernameToAdd;
                const result: string = await this.userService.addFriend(user, usernameToAdd);

                if (result === 'success') {
                    res.status(StatusCodes.OK).send();
                    return;
                } else {
                    res.status(StatusCodes.BAD_REQUEST).send(result);
                    return;
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.patch('/remove-friend', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.email || !body.emailToRemove) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }

                const user = await this.userService.getUser(body.email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                }
                const emailToRemove = body.emailToRemove;
                const result: string = await this.userService.removeFriend(user, emailToRemove);

                if (result === 'success') {
                    res.status(StatusCodes.OK).send();
                    return;
                } else {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.patch('/update-settings', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.userpreferences || !body.email) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }

                const user = await this.userService.getUser(body.email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                }
                const preferences = JSON.parse(body.userpreferences);
                user.preferences = preferences;
                const result: string = await this.userService.updateSettings(user);

                if (result === 'success') {
                    res.status(StatusCodes.OK).send();
                    return;
                } else {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.patch('/invite-friend', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.emailFriend || !body.email) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }

                const user = await this.userService.getUser(body.email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                }
                const preferences = JSON.parse(body.userpreferences);
                user.preferences = preferences;
                const result: string = await this.userService.updateSettings(user);

                if (result === 'success') {
                    res.status(StatusCodes.OK).send();
                    return;
                } else {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });

        this.router.patch('/update-avatar', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.email || !body.avatar) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
                const user = await this.userService.getUser(body.email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                } else {
                    //
                    // TODO refactor this (updateAvatar is not really needed (see update-pseudo))
                    const result: string = await this.userService.updateAvatar(body.email, body.avatar);
                    if (result === 'success') {
                        res.status(StatusCodes.OK).send();
                        return;
                    } else {
                        res.status(StatusCodes.EXPECTATION_FAILED).send();
                        return;
                    }
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });
        this.router.patch('/update-pseudo', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.email || !body.pseudo) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }

                const user = await this.userService.getUser(body.email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                } else {
                    const newUsername: string = body.pseudo;
                    // getEmail returns null if there is not email associated with the username
                    const emailOfNewUsername = await this.userService.getEmail(newUsername);
                    if (emailOfNewUsername !== null) {
                        res.status(StatusCodes.FORBIDDEN).send();
                        return;
                    }
                    const oldUsername = user.username;
                    user.username = newUsername;
                    const result: string = await this.userService.updateUser(user);
                    if (result === 'success') {
                        this.userService.replaceActiveUser(oldUsername, newUsername);
                        await this.userService.removeUserData(oldUsername);
                        await this.userService.writeUserData(newUsername, user.email, '');
                        res.status(StatusCodes.OK).send();
                        return;
                    } else {
                        res.status(StatusCodes.EXPECTATION_FAILED).send();
                        return;
                    }
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });
        this.router.patch('/update-pseudo', async (req: Request, res: Response) => {
            try {
                const body = req.body;
                if (!body || !body.email || !body.pseudo) {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
                const user = await this.userService.getUser(body.email);
                const isConnected = this.userService.isConnected(user.username);
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                } else {
                    const oldUsername = user.username;
                    user.username = body.pseudo;
                    const result: string = await this.userService.updateUser(user);
                    if (result === 'success') {
                        this.userService.replaceActiveUser(oldUsername, body.pseudo);
                        res.status(StatusCodes.OK).send();
                        return;
                    } else {
                        res.status(StatusCodes.EXPECTATION_FAILED).send();
                        return;
                    }
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });
        this.router.get('/games-statistics', async (req: Request, res: Response) => {
            try {
                const email = req.query.email;
                if (!email || typeof email !== 'string') {
                    res.status(StatusCodes.BAD_REQUEST).send();
                    return;
                }
                const user = await this.userService.getUser(email);
                // const isConnected = this.userService.isConnected(user.username);
                const isConnected = true;
                if (!isConnected) {
                    res.status(StatusCodes.UNAUTHORIZED).send();
                    return;
                } else {
                    const games: PlayerGameDocument[] = await this.userService.getUserGames(user);
                    if (!games) {
                        res.status(StatusCodes.EXPECTATION_FAILED).send();
                        return;
                    } else {
                        res.status(StatusCodes.OK).send(games);
                        return;
                    }
                }
            } catch (error) {
                res.status(StatusCodes.UNAUTHORIZED).send(error.message);
            }
        });
        // this.router.post('/simulate-end-game', async (req: Request, res: Response) => {
        //     try {
        //         if (!req.body || !req.body.email) {
        //             res.status(StatusCodes.BAD_REQUEST).send();
        //             return;
        //         }
        //         const emailOfPlayers = ['BOWSER55@gmail.com', req.body.email];
        //         const timestamp = DateService.getParsableTimestamp();
        //         const hardCodedTimestamp = '03/12/22, 04:58:45';
        //         const gameDuration = DateService.getParsableTimestampsDifference(timestamp, hardCodedTimestamp);

        //         const game: GameDocument = {
        //             playersEmail: emailOfPlayers,
        //             startTime: timestamp,
        //             gameDuration,
        //         };
        //         const playerReport: PlayerGameDocument = {
        //             score: 100,
        //             joinTime: timestamp,
        //             endType: 'victoire',
        //             gameDuration,
        //         };
        //         // Creer la partie sur la database (à la fin d'une partie)
        //         const dbResult: DbGameOperationResult = await this.userService.createGameDocument(game);
        //         if (dbResult.message !== 'success' || !dbResult.gameUid) {
        //             res.status(StatusCodes.EXPECTATION_FAILED).send(dbResult);
        //             return;
        //         }
        //         // Ajouter le gameUid de la partie créé sur la database à la liste de parties jouées par une joueur
        //         const user: User = await this.userService.getUser(req.body.email);
        //         if (!user.gamesUidPlayed) {
        //             // Cette ligne n'a pas l'effet escompté
        //             user.gamesUidPlayed = [];
        //         }
        //         user.gamesUidPlayed.push(dbResult.gameUid);
        //         const updateResult = await this.userService.updateUser(user);
        //         if (updateResult !== 'success') {
        //             res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
        //             return;
        //         }

        //         // Mettre les games reports de chaque joueur sur la DB
        //         await this.userService.addPlayerGameDocument(dbResult.gameUid, emailOfPlayers[0], playerReport);
        //         await this.userService.addPlayerGameDocument(dbResult.gameUid, emailOfPlayers[1], playerReport);
        //         res.status(StatusCodes.OK).send();
        //     } catch (error) {
        //         res.status(StatusCodes.UNAUTHORIZED).send(error.message);
        //     }
        // });
    }
}
