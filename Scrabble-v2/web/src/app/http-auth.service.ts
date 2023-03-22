import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserPreferences } from './interfaces/user';

export interface User {
    username?: string;
    email?: string;
    password?: string;
    isAdmin?: boolean;
    rating?: number;
    receivedRatingReward?: boolean;
    avatar?: string;
    coins?: number;
    connexions?: string[];
    deconnexions?: string[];
    preferences?: UserPreferences;
    themes?: string[];
    friends?: string[];
}

@Injectable({
    providedIn: 'root',
})
export class HttpAuthService {
    statusCode: number;
    private baseUrl: string;
    constructor(private http: HttpClient) {
        this.baseUrl = environment.serverUrl;
        this.statusCode = 0;
    }

    login(email: string, password: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/login`;
        const user: User = { email, password };
        return this.http
            .post<User>(userUrl, user, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<User>('login')));
    }

    createAccount(pseudo: string, email: string, password: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/create`;
        const user: User = { username: pseudo, email, password };
        return this.http
            .post<User>(userUrl, user, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<User>('create')));
    }

    logout(pseudo: string) {
        this.clearError();
        const userUrl = `${this.baseUrl}/user/logout`;
        const user: User = { username: pseudo };
        return this.http
            .post<User>(userUrl, user, { headers: this.createCacheHeaders(), observe: 'response' })
            .pipe(catchError(this.handleError<User>('logout')));
    }

    anErrorOccurred(): boolean {
        return this.statusCode !== 0;
    }
    private clearError() {
        this.statusCode = 0;
    }
    private createCacheHeaders(): HttpHeaders {
        return new HttpHeaders().set('Cache-Control', 'no-cache').set('Expires', '0');
    }

    private handleError<T>(request: string, result?: T): (error: HttpErrorResponse) => Observable<T> {
        return (error: HttpErrorResponse): Observable<T> => {
            this.handleErrorStatusCode(error.status);
            return of(result as T);
        };
    }
    private handleErrorStatusCode(code: number) {
        this.statusCode = code;
    }
}
