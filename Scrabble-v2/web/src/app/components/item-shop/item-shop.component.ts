import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemShop } from '@app/interfaces/item-shop';
import { PseudoService } from '@app/pseudo.service';

@Component({
    selector: 'app-item-shop',
    templateUrl: './item-shop.component.html',
    styleUrls: ['./item-shop.component.scss'],
})
export class ItemShopComponent {
    @Input() item: ItemShop;
    @Input() isDisabled: boolean;
    @Output() itemAdded = new EventEmitter();

    constructor(private loggedUser: PseudoService) {
        this.isDisabled = true;
    }

    addItemToCart(item: ItemShop) {
        this.itemAdded.emit(item);
    }

    isAvailable(nameTheme: string) {
        return !this.loggedUser.themes.includes(nameTheme);
    }
}
