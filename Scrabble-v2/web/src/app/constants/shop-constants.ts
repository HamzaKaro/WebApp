import { ItemShop } from '@app/interfaces/item-shop';

export const DURATION_IN_SECONDS_SNACKBAR = 5;
export const FACTOR_MILLISECONDS = 1000;
export const INITIAL_TOTAL_PRICE = 0;
export const EMPTY_SHOPPING_CART_LENGTH = 0;
export const CHEAP_PRICE_IN_COINS = 10;
export const MIDDLE_PRICE_IN_COINS = 25;
export const HIGH_PRICE_IN_COINS = 40;

export const ITEMS_LIST: ItemShop[] = [
    { name: 'uni', price: CHEAP_PRICE_IN_COINS, isAvailable: true },
    { name: 'fallGuys', price: CHEAP_PRICE_IN_COINS, isAvailable: true },
    { name: 'minecraft', price: HIGH_PRICE_IN_COINS, isAvailable: true },
    { name: 'bubbleTea', price: HIGH_PRICE_IN_COINS, isAvailable: true },
    { name: 'halloween', price: MIDDLE_PRICE_IN_COINS, isAvailable: true },
];
