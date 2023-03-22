import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITEMS_LIST } from '@app/constants/shop-constants';
import { ItemShop } from '@app/interfaces/item-shop';

@Component({
    selector: 'app-shopping-cart',
    templateUrl: './shopping-cart.component.html',
    styleUrls: ['./shopping-cart.component.scss'],
})
export class ShoppingCartComponent {
    @Input() itemsShoppingCart: ItemShop;
    @Output() itemRemoved = new EventEmitter();
    items: ItemShop[];

    constructor() {
        this.items = ITEMS_LIST;
    }

    removeItemFromCart(item: ItemShop) {
        this.itemRemoved.emit(item);
    }
}
