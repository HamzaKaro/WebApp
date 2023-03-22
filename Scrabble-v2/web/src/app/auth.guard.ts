import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
// line below in comment temporary to fix lint
// import {ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { PseudoService } from './pseudo.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private userService: PseudoService) {}
    canActivate(): //
    // two lines below in comment temporary to fix lint
    // route: ActivatedRouteSnapshot,
    // state: RouterStateSnapshot,
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        /* eslint-disable @typescript-eslint/no-unused-expressions -- disabling to ease testing*/

        return true || this.userService.pseudo;
    }
}
