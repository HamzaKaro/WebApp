import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EMPTY_SHOPPING_CART_LENGTH, INITIAL_TOTAL_PRICE, ITEMS_LIST } from '@app/constants/shop-constants';
import { LISTE_THEMES } from '@app/constants/themes-constants';
import { ItemShop } from '@app/interfaces/item-shop';
import { PseudoService } from '@app/pseudo.service';
import { ShoppingCartService } from '@app/services/shopping-cart.service';
import { SoundService } from '@app/services/sound.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-virtual-store-page',
    templateUrl: './virtual-store-page.component.html',
    styleUrls: ['./virtual-store-page.component.scss'],
})
export class VirtualStorePageComponent {
    @HostBinding('class') componentCssClass: unknown;

    @Input() items: ItemShop[];
    @Input() shoppingCart: ItemShop[];
    @Input() totalPrice: number;
    // @Input() isDisabled: boolean;
    @Input() isDisabledBuyButton: boolean;
    @Input() isDisabledCancelButton: boolean;

    @Output() itemAdded = new EventEmitter();
    isValidTransaction: boolean;
    themes: string[] = LISTE_THEMES;

    constructor(
        private shoppingCartService: ShoppingCartService,
        public loggedUser: PseudoService,
        private snackBar: MatSnackBar,
        private soundService: SoundService,
        private translate: TranslateService,
    ) {
        this.items = ITEMS_LIST;
        this.shoppingCart = [];
        this.totalPrice = INITIAL_TOTAL_PRICE;
        // this.isDisabled = true;
        this.isDisabledBuyButton = true;
        this.isDisabledCancelButton = true;
    }

    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    specialPlaySound() {
        if (this.isValidTransaction) {
            this.soundService.controllerSound('Unlocked');
        } else this.soundService.controllerSound('Alert');
    }

    openSnackBar(action: string) {
        if (!this.isValidTransaction) {
            this.snackBar.open(this.translate.instant('shop.not_enough_token_user_msg'), action, {
                duration: 4000,
                panelClass: ['custom-style'],
            });
        }
    }

    async addItemToCart(item: ItemShop) {
        if (item.isAvailable) {
            this.isDisabledCancelButton = false;
            this.isDisabledBuyButton = false;
            this.shoppingCartService.userShoppingCart = this.shoppingCart;
            this.shoppingCartService.addItem(item);
            this.totalPrice = this.shoppingCartService.sumAmountToPay;
        }
    }

    removeItemFromCart(item: ItemShop) {
        this.isDisabledBuyButton = false;
        this.shoppingCartService.userShoppingCart = this.shoppingCart;
        this.shoppingCartService.removeItem(item);

        if (this.shoppingCart.length === EMPTY_SHOPPING_CART_LENGTH) {
            this.isDisabledCancelButton = true;
            this.isDisabledBuyButton = true;
        }

        this.totalPrice = this.shoppingCartService.sumAmountToPay;
    }

    buyItemsFromCart() {
        this.shoppingCartService.userShoppingCart = this.shoppingCart;

        this.shoppingCartService.verifyTransaction(this.loggedUser.email, this.totalPrice, this.loggedUser.themes);
        if (this.loggedUser.coins >= this.totalPrice) {
            this.loggedUser.coins -= this.totalPrice;
            this.isValidTransaction = true;
        } else {
            this.isValidTransaction = false;
        }

        this.shoppingCartService.emptyShoppingCart();
        this.shoppingCartService.resetTotalPriceShoppingCart();

        this.totalPrice = this.shoppingCartService.sumAmountToPay;
        this.isDisabledCancelButton = true;
        this.isDisabledBuyButton = true;
    }

    cancelTransaction() {
        this.shoppingCartService.currentAmountToPay = this.totalPrice;
        this.shoppingCartService.userShoppingCart = this.shoppingCart;

        this.shoppingCartService.cancelTransaction();
        this.shoppingCartService.resetTotalPriceShoppingCart();
        this.totalPrice = this.shoppingCartService.sumAmountToPay;
        this.isDisabledCancelButton = true;
        this.isDisabledBuyButton = true;
    }
}
