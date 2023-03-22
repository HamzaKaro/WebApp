export interface User {
    id: number;
    username: string;
    email: string;
    preferences: {
        theme: string;
        language: string;
        visualAnimations: boolean;
        soundAnimations: boolean;
    };
    elo: number;
    coins: number;
    items: string[];
    channels: string[];
    achievements: Achievement[];
    avatar: string;
    friends: string[];
    rating: number; // The rating of the app (0 if not done else [1, 5])
    receivedRatingReward: boolean;
    connexions: string[];
    deconnexions: string[];
    gamesUidPlayed: string[];
    themes: string[];
    // history: {

    // }
}
export interface Achievement {
    id: number;
    name: string;
    description: string;
    level: 'gold' | 'silver' | 'bronze';
    date: Date;
}
