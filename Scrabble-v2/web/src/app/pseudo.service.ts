import { Injectable } from '@angular/core';
import { UserPreferences } from './interfaces/user';
// TODO (david) rename this because it will not contain only the pseudo in the future

@Injectable({
    providedIn: 'root',
})
export class PseudoService {
    pseudo: string;
    email: string;
    hasRated: boolean;
    rating: number;
    receivedRatingReward: boolean;
    coins: number;
    avatar: string;
    connexions: string[];
    deconnexions: string[];
    themes: string[];
    preferences: UserPreferences;
    friends: string[];
    isAdmin: boolean;
    constructor() {
        this.pseudo = '';
        this.email = '';
        this.hasRated = true;
        this.rating = 0;
        this.receivedRatingReward = false;
        this.avatar = '';
        this.connexions = [];
        this.deconnexions = [];
        this.themes = [];
        this.isAdmin = false;
    }

    addCoins(coins: number) {
        // TODO do a http request to send it to the server
        this.coins += coins;
    }

    disconnect() {
        this.pseudo = '';
        this.email = '';
        this.hasRated = false;
        this.receivedRatingReward = false;
        this.coins = 0;
        this.avatar = '';
        this.rating = 0;
        this.connexions = [];
        this.deconnexions = [];
        this.preferences = {
            theme: 'light',
            language: 'en',
            visualAnimations: false,
            soundAnimations: false,
        };
        this.isAdmin = false;
        this.themes = [];
    }

    isConnected() {
        return this.pseudo !== '';
    }
}
