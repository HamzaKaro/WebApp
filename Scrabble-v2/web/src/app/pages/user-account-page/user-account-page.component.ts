import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploadAvatarPopupComponent } from '@app/components/upload-avatar-popup/upload-avatar-popup.component';
import { POPUP_HEIGHT, POPUP_WIDTH } from '@app/constants/avatar-constants';
import { SNACKBAR_DURATION_IN_MS } from '@app/constants/constants';
import { ElectronWindowsCommunicationService } from '@app/electron-windows-communication.service';
import { ErrorDialogComponent } from '@app/error-dialog/error-dialog.component';
import { HttpUserDataService } from '@app/http-user-data.service';
import { DataToChatWindow } from '@app/interfaces/electron-windows-communication';
import { PseudoService } from '@app/pseudo.service';
import { SoundService } from '@app/services/sound.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-user-account-page',
    templateUrl: './user-account-page.component.html',
    styleUrls: ['./user-account-page.component.scss'],
})
export class UserAccountPageComponent {
    urlAvatar: string;
    form: FormGroup;
    private successfulModifications: string[];
    constructor(
        private translate: TranslateService,
        private dialog: MatDialog,
        public loggedUser: PseudoService,
        private fb: FormBuilder,
        private http: HttpUserDataService,
        private snackBar: MatSnackBar,
        private soundService: SoundService,
        private electronService: ElectronWindowsCommunicationService,
    ) {
        this.urlAvatar = this.loggedUser.avatar;
        this.form = this.fb.group({
            pseudo: [this.loggedUser.pseudo, [Validators.required, Validators.pattern('^[a-zA-Z0-9]{5,16}$')]],
            email: [this.loggedUser.email, []],
        });
        this.form.controls.email.disable();
        this.successfulModifications = [];
    }

    openUploadAvatarPopup() {
        const dialog = this.dialog.open(UploadAvatarPopupComponent, {
            width: POPUP_WIDTH,
            height: POPUP_HEIGHT,
            autoFocus: true,
        });
        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
            this.urlAvatar = result;
        });
    }
    async registerModifications() {
        this.successfulModifications = [];
        if (this.avatarChanged()) {
            await this.http.updateAvatar(this.loggedUser.email, this.urlAvatar).toPromise();
            if (this.http.anErrorOccurred()) {
                this.dialog.open(ErrorDialogComponent, {
                    width: POPUP_WIDTH,
                    height: POPUP_HEIGHT,
                    autoFocus: true,
                    data: this.translate.instant('profile_page.failed_avatar_modifications'),
                });
            } else {
                this.loggedUser.avatar = this.urlAvatar;
                this.notifyChat();
                this.successfulModifications.push('avatar');
            }
        }
        if (this.pseudoChanged()) {
            await this.http.updatePseudo(this.loggedUser.email, this.pseudo.value).toPromise();
            if (this.http.anErrorOccurred()) {
                this.dialog.open(ErrorDialogComponent, {
                    width: POPUP_WIDTH,
                    height: POPUP_HEIGHT,
                    autoFocus: true,
                    data: this.translate.instant('profile_page.failed_pseudo_modification'),
                });
            } else {
                this.loggedUser.pseudo = this.pseudo.value;
                this.notifyChat();
                this.successfulModifications.push('pseudo');
            }
        }
        this.displaySnackbar();
    }
    notifyChat() {
        const dataForChatWindow: DataToChatWindow = {
            electronEvent: 'update-avatar-and-pseudo',
            electronEventData: { avatar: this.loggedUser.avatar, pseudo: this.loggedUser.pseudo },
        };
        this.electronService.sendEventToChatWindow(dataForChatWindow);
    }
    displaySnackbar() {
        if (this.successfulModifications.includes('avatar') && this.successfulModifications.includes('pseudo')) {
            this.snackBar.open('Modifications réussies', this.translate.instant('actions.close'), {
                duration: SNACKBAR_DURATION_IN_MS,
            });
            return;
        }
        if (this.successfulModifications.includes('avatar')) {
            this.snackBar.open(this.translate.instant('profile_page.successful_avatar_modification'), this.translate.instant('actions.close'), {
                duration: SNACKBAR_DURATION_IN_MS,
            });
            return;
        }
        if (this.successfulModifications.includes('pseudo')) {
            this.snackBar.open(this.translate.instant('profile_page.successful_pseudo_modification'), this.translate.instant('actions.close'), {
                duration: SNACKBAR_DURATION_IN_MS,
            });
            return;
        }
    }
    cancelModifications() {
        this.form.controls.pseudo.setValue(this.loggedUser.pseudo);
        this.urlAvatar = this.loggedUser.avatar;
    }

    isRegisterable() {
        return this.userAccountChanged() && this.pseudo.valid;
    }

    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    get pseudo(): FormControl {
        return this.form.controls.pseudo as FormControl;
    }
    userAccountChanged(): boolean {
        return this.avatarChanged() || this.pseudoChanged();
    }
    private pseudoChanged(): boolean {
        return this.loggedUser.pseudo !== this.pseudo.value;
    }
    private avatarChanged(): boolean {
        return this.loggedUser.avatar !== this.urlAvatar;
    }
}
