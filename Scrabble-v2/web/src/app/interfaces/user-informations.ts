import { UserPreferences } from './user';

export interface UserInformations {
    pseudo: string;
    email: string;
    rating: number;
    avatar: string;
    coins: number;
    isAdmin: boolean;
    receivedRatingReward: boolean;
    connexions: string[];
    deconnexions: string[];
    preferences: UserPreferences;
    friends: string[];
    themes: string[];
}
