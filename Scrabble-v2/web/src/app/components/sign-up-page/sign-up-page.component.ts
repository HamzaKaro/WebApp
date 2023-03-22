import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthServiceService, User } from '@app/auth-service.service';
import { UploadAvatarPopupComponent } from '@app/components/upload-avatar-popup/upload-avatar-popup.component';
import { AVATAR_DEFAULT, POPUP_HEIGHT, POPUP_WIDTH, SUCCESSFUL_UPLOAD_MESSAGE } from '@app/constants/avatar-constants';
import { MIN_LENGTH_PASSWORD } from '@app/constants/constants';
import { Avatar } from '@app/interfaces/avatar';
import { UserPreferences } from '@app/interfaces/user';
import { LoginService } from '@app/login.service';
// import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-sign-up-page',
    templateUrl: './sign-up-page.component.html',
    styleUrls: ['./sign-up-page.component.scss'],
})
export class SignUpPageComponent implements OnInit {
    @Input() avatars: Avatar[];
    signUpForm: FormGroup;
    errorMessage: string;
    successMessage: string;
    urlAvatar: string;
    isValidatingCredentials: boolean;
    constructor(
        private fb: FormBuilder,
        private auth: AuthServiceService,
        private router: Router,
        // private socketService: SocketClientService,
        private dialog: MatDialog,
        private loginService: LoginService,
    ) {
        this.signUpForm = this.fb.group({
            pseudo: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]{5,16}$')]],
            email: ['', [Validators.required, Validators.pattern('^[^@]+@[^@]+.[^@]+$')]],
            password: ['', [Validators.required, Validators.minLength(MIN_LENGTH_PASSWORD)]],
        });
        this.errorMessage = '';
        this.isValidatingCredentials = false;
        this.urlAvatar = AVATAR_DEFAULT;
    }
    async signUp() {
        this.isValidatingCredentials = true;
        this.clearErrorMessage();
        const response = await this.auth.createAccount(this.pseudo.value, this.email.value, this.password.value, this.urlAvatar).toPromise();
        if (this.auth.anErrorOccurred()) {
            this.createErrorMessage();
            this.isValidatingCredentials = false;
        } else {
            const body = (response as HttpResponse<User>).body;
            this.loginService.login({
                pseudo: body?.username as string,
                email: body?.email as string,
                rating: body?.rating as number,
                receivedRatingReward: body?.receivedRatingReward as boolean,
                avatar: body?.avatar as string,
                coins: body?.coins as number,
                isAdmin: (body?.isAdmin as boolean) || false,
                connexions: body?.connexions as string[],
                deconnexions: body?.deconnexions as string[],
                preferences: body?.preferences as UserPreferences,
                themes: body?.themes as string[],
                friends: body?.friends as string[],
            });
        }
    }
    ngOnInit(): void {
        // Add line below temporary to fix lint problem (Remove it later)
        return;
    }

    connectSocket() {
        // Assumes the socket is not already connected
        // this.socketService.connect();
    }

    createErrorMessage() {
        switch (this.auth.statusCode) {
            case HttpStatusCode.ExpectationFailed:
                this.errorMessage = "Un compte est déjà associé à cet email ou l'email est invalide";
                break;
            case HttpStatusCode.Conflict:
                this.errorMessage = 'Ce pseudo est déjà pris par un autre utilisateur';
                break;
            case HttpStatusCode.BadRequest:
                this.errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard';
                break;
            default:
                this.errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard';
                break;
        }
    }

    clearErrorMessage() {
        this.errorMessage = '';
    }
    returnToPreviousPage() {
        this.router.navigate(['/login']);
    }
    openUploadAvatarPopup() {
        const dialog = this.dialog.open(UploadAvatarPopupComponent, {
            width: POPUP_WIDTH,
            height: POPUP_HEIGHT,
            autoFocus: true,
            data: this.avatars,
        });
        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
            this.successMessage = SUCCESSFUL_UPLOAD_MESSAGE;
            this.urlAvatar = result;
        });
    }
    isAvatarExist(): boolean {
        return this.urlAvatar !== AVATAR_DEFAULT;
    }
    get pseudo(): FormControl {
        return this.signUpForm.controls.pseudo as FormControl;
    }
    get email(): FormControl {
        return this.signUpForm.controls.email as FormControl;
    }
    get password(): FormControl {
        return this.signUpForm.controls.password as FormControl;
    }
    isFormValid(): boolean {
        return this.pseudo.valid && this.email.valid && this.password.valid && this.isAvatarExist();
    }
}
