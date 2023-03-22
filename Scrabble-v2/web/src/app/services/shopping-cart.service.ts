import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { POPUP_HEIGHT, POPUP_WIDTH } from '@app/constants/avatar-constants';
import { ErrorDialogComponent } from '@app/error-dialog/error-dialog.component';
import { HttpUserDataService } from '@app/http-user-data.service';
import { ItemShop } from '@app/interfaces/item-shop';
import { PseudoService } from '@app/pseudo.service';

@Injectable({
    providedIn: 'root',
})
export class ShoppingCartService {
    currentAmountCoins: number;
    currentAmountToPay: number;
    userShoppingCart: ItemShop[];
    isTransactionDone: boolean;

    constructor(private http: HttpUserDataService, private dialog: MatDialog, private pseudoService: PseudoService) {
        this.userShoppingCart = [];
        this.currentAmountCoins = this.pseudoService.coins;
        this.currentAmountToPay = 0;
        this.isTransactionDone = false;
    }

    get sumAmountToPay(): number {
        return this.currentAmountToPay;
    }
    get getUsercoins(): number {
        return this.pseudoService.coins;
    }

    increaseAmountToPay(priceItem: number): void {
        this.currentAmountToPay += priceItem;
    }

    decreaseAmountToPay(priceItem: number): void {
        this.currentAmountToPay -= priceItem;
    }

    resetTotalPriceShoppingCart() {
        if (this.userShoppingCart.length === 0) {
            this.currentAmountToPay = 0;
        }
    }

    async verifyTransaction(email: string, coins: number, themesPreferenceList: string[]) {
        if (this.pseudoService.coins >= this.currentAmountToPay) {
            this.userShoppingCart.forEach((value) => {
                themesPreferenceList.push(value.name);
            });
            this.isTransactionDone = true;
            await this.http.addCoins(email, -coins).toPromise();
            await this.http.addTheme(email, themesPreferenceList).toPromise();
            if (this.http.anErrorOccurred()) {
                this.dialog.open(ErrorDialogComponent, {
                    width: POPUP_WIDTH,
                    height: POPUP_HEIGHT,
                    autoFocus: true,
                    data: 'La mise à jour de vos coins est un échec',
                });
            } else {
                this.pseudoService.coins -= this.currentAmountToPay;
            }
        }
    }

    addItem(item: ItemShop) {
        if (!this.userShoppingCart.find((i) => i.name === item.name)) {
            this.userShoppingCart.push(item);

            this.resetTotalPriceShoppingCart();
            this.increaseAmountToPay(item.price);
        }
    }

    removeItem(item: ItemShop) {
        this.userShoppingCart.forEach((i, index) => {
            if (i.name === item.name) {
                this.userShoppingCart.splice(index, 1);
                this.decreaseAmountToPay(item.price);
            }
        });
    }

    emptyShoppingCart() {
        if (this.isTransactionDone) {
            this.cancelTransaction();
        }
    }
    cancelTransaction(): void {
        this.userShoppingCart.length = 0;
        this.resetTotalPriceShoppingCart();
    }
}
