import { Component } from '@angular/core';
import { PseudoService } from '@app/pseudo.service';
@Component({
    selector: 'app-connexions-history',
    templateUrl: './connexions-history.component.html',
    styleUrls: ['./connexions-history.component.scss'],
})
export class ConnexionsHistoryComponent {
    constructor(public loggedUser: PseudoService) {}
}
