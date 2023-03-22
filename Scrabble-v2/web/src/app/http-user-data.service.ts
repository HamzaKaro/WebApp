/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    DEFAULT_MESSAGE,
    FORBIDDEN_MESSAGE,
    GONE_RESSOURCE_MESSAGE,
    UNREACHABLE_SERVER_MESSAGE,
    UNREACHABLE_SERVER_STATUS_CDOE,
} from '@app/constants/http-constants';
import { PlayerGameReport } from '@app/interfaces/player-game-report';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserPreferences } from './interfaces/user';

@Injectable({
    providedIn: 'root',
})
export class HttpUserDataService {
    private baseUrl: string;
    private errorMessage: string;
    constructor(private http: HttpClient) {
        this.baseUrl = environment.serverUrl;
        this.errorMessage = '';
    }

    isConnected(username: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/is-connected`;
        return this.http
            .post<string>(userUrl, username, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<string>('is-connected')));
    }

    // ** System data ** //
    updateRating(email: string, rating: number) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/update-ratings`;
        return this.http
            .patch<any>(userUrl, { email, rating }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('update-ratings')));
    }
    // ** User data ** //
    getGamesStatistics(email: string): Observable<PlayerGameReport[]> {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/games-statistics?email=${email}`;
        return this.http
            .get<PlayerGameReport[]>(userUrl, { headers: this.createCacheHeaders() })
            .pipe(catchError(this.handleError<PlayerGameReport[]>('games-statistics')));
    }

    getUser(email: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/get-user?email=${email}`;
        return this.http
            .get<any>(userUrl, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('get-user')));
    }

    addTheme(email: string, themeToAdd: string[]) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/add-theme`;
        return this.http
            .patch<any>(userUrl, { email, themeToAdd: JSON.stringify(themeToAdd) }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('add-theme')));
    }

    getUserCoins() {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/user-coins`;
        return this.http
            .get<any>(userUrl, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('user-coins')));
    }

    getActiveUsers() {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/get-active-users`;
        return this.http
            .get<any>(userUrl, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('get-active-users')));
    }

    getUsersInGame() {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/get-users-in-game`;
        return this.http
            .get<any>(userUrl, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('get-get-users-in-game')));
    }

    getFriends(email: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/get-friends?email=${email}`;
        return this.http
            .get<any>(userUrl, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('get-friends')));
    }

    getUncontactedFriends(email: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/get-uncontacted-friends?email=${email}`;
        return this.http
            .get<any>(userUrl, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('get-uncontacted-friends')));
    }

    removeFriend(email: string, emailToRemove: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/remove-friend`;
        return this.http
            .patch<any>(userUrl, { email, emailToRemove }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('remove-friend')));
    }

    addFriend(email: string, usernameToAdd: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/add-friend`;
        return this.http
            .patch<any>(userUrl, { email, usernameToAdd }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('add-friend')));
    }

    updateAvatar(email: string, avatar: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/update-avatar`;
        return this.http
            .patch<any>(userUrl, { email, avatar }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('update-avatar')));
    }
    updatePseudo(email: string, pseudo: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/update-pseudo`;
        return this.http
            .patch<any>(userUrl, { email, pseudo }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('update-pseudo')));
    }

    updateSettings(email: string, preferences: UserPreferences) {
        this.clearError();
        const userpreferences = JSON.stringify(preferences);
        const userUrl = `${this.baseUrl}/user/update-settings`;
        return this.http
            .patch<any>(userUrl, { email, userpreferences }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('update-settings')));
    }

    inviteFriend(email: string, emailFriend: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/invite-friend`;
        return this.http
            .patch<any>(userUrl, { email, emailFriend }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('invite-friend')));
    }

    // User specific methods
    claimRatingReward(email: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/claim-rating-reward`;
        return this.http
            .patch<any>(userUrl, { email }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('add-coins')));
    }

    // Note : The number of coins can be negative
    addCoins(email: string, coins: number) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/add-coins`;
        return this.http
            .patch<any>(userUrl, { email, coins }, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<any>('add-coins')));
    }
    anErrorOccurred(): boolean {
        return this.errorMessage !== '';
    }
    getErrorMessage(): string {
        return this.errorMessage;
    }
    private createCacheHeaders(): HttpHeaders {
        return new HttpHeaders().set('Cache-Control', 'no-cache').set('Expires', '0');
    }
    private clearError() {
        this.errorMessage = '';
    }
    private handleErrorStatusCode(code: number) {
        switch (code) {
            case UNREACHABLE_SERVER_STATUS_CDOE:
                this.errorMessage = UNREACHABLE_SERVER_MESSAGE;
                break;
            case HttpStatusCode.Gone:
                this.errorMessage = GONE_RESSOURCE_MESSAGE;
                break;
            case HttpStatusCode.Forbidden:
                this.errorMessage = FORBIDDEN_MESSAGE;
                break;
            default:
                this.errorMessage = DEFAULT_MESSAGE;
                break;
        }
    }
    private handleError<T>(request: string, result?: T): (error: HttpErrorResponse) => Observable<T> {
        return (error: HttpErrorResponse): Observable<T> => {
            this.handleErrorStatusCode(error.status);
            return of(result as T);
        };
    }
}
