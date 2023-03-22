import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpUserDataService } from './http-user-data.service';
import { PseudoService } from './pseudo.service';

export interface Friend {
    username: string;
    email: string;
}

@Injectable({
    providedIn: 'root',
})
export class FriendsService {
    // Friends
    user: PseudoService;
    friendsEmail = new BehaviorSubject<string[]>([]);
    activeUsers = new BehaviorSubject<string[]>([]);
    usersInGame = new BehaviorSubject<string[]>([]);
    friendsUsername = new BehaviorSubject<string[]>([]);
    connectedUsers = new BehaviorSubject<string[]>([]);
    friendsStatus: string[];
    constructor(public loggedUser: PseudoService, private http: HttpUserDataService) {
        this.user = loggedUser;
        this.friendsEmail.next(loggedUser.friends);
        this.friendsUsername.subscribe();
        this.activeUsers.subscribe();
    }
    async init() {
        const result = await this.http.getFriends(this.loggedUser.email).toPromise();
        this.friendsUsername.next(result.body);
        await this.getUsersInGame();
        await this.getActiveUser();
        this.setStatusFriends();
    }

    async refresh() {
        const getUserResult = await this.http.getUser(this.loggedUser.email).toPromise();
        this.loggedUser = getUserResult.body;
        const getFriendsResult = await this.http.getFriends(this.loggedUser.email).toPromise();
        this.friendsUsername.next(getFriendsResult.body);
        this.user = this.loggedUser;
        this.friendsEmail.next(this.loggedUser.friends);
        this.setStatusFriends();
    }

    async getActiveUser() {
        const response = await this.http.getActiveUsers().toPromise();
        this.activeUsers.next(response.body as string[]);
    }

    async getUsersInGame() {
        const response = await this.http.getUsersInGame().toPromise();
        this.usersInGame.next(response.body as string[]);
    }
    setStatusFriends() {
        this.friendsStatus = [];
        this.friendsUsername.value.forEach((username) => {
            this.friendsStatus.push(this.getStatus(username));
        });
    }

    getStatus(username: string) {
        if (this.usersInGame.value.includes(username)) return 'Busy';
        else if (this.activeUsers.value.includes(username)) return 'Online';
        else return 'Offline';
    }

    getAvailableFriends(): Friend[] {
        const availableFriends: Friend[] = [];
        for (let i = 0; i < this.friendsUsername.value.length; i++) {
            if (this.friendsStatus[i] === 'Online') {
                availableFriends.push({
                    username: this.friendsUsername.value[i],
                    email: this.friendsEmail.value[i],
                });
            }
        }
        return availableFriends;
    }
}
