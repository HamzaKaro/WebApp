import { ItemStore } from '@app/interfaces/item-store';

// PRICE FOR EACH ITEM STORE (IN COINS) //
export const CHEAP_PRICE_IN_COINS = 5;
export const NORMAL_PRICE_IN_COINS = 50;
export const HIGH_PRICE_IN_COINS = 80;

// ID ITEM STORE //
export const PINK_THEME_ID = 1;
export const YELLOW_THEME_ID = 2;
export const BLUE_THEME_ID = 3;
export const PURPLE_THEME_ID = 4;
export const RED_THEME_ID = 5;

// ITEMS STORE MAP //
export const ITEMS_SHOP_MAP: Map<number, ItemStore> = new Map([
    [PINK_THEME_ID, { name: 'pink', price: CHEAP_PRICE_IN_COINS, isAvailable: false }],
    [YELLOW_THEME_ID, { name: 'yellow', price: NORMAL_PRICE_IN_COINS, isAvailable: false }],
    [BLUE_THEME_ID, { name: 'blue', price: NORMAL_PRICE_IN_COINS, isAvailable: false }],
    [PURPLE_THEME_ID, { name: 'purple', price: HIGH_PRICE_IN_COINS, isAvailable: false }],
    [RED_THEME_ID, { name: 'red', price: HIGH_PRICE_IN_COINS, isAvailable: false }],
]);
