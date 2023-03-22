import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MIN_LENGTH_EMAIL, MIN_LENGTH_PASSWORD } from '@app/constants/constants';
import { HttpAuthService, User } from '@app/http-auth.service';
import { UserPreferences } from '@app/interfaces/user';
import { LoginService } from '@app/login.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    signUpForm: FormGroup;
    errorMessage: string;
    isValidatingCredentials: boolean;
    constructor(
        private fb: FormBuilder,
        private auth: HttpAuthService,
        private loginService: LoginService,
        private translateService: TranslateService,
    ) {
        this.signUpForm = this.fb.group({
            email: ['', [Validators.required, Validators.minLength(MIN_LENGTH_EMAIL)]],
            password: ['', [Validators.required, Validators.minLength(MIN_LENGTH_PASSWORD)]],
        });
        this.errorMessage = '';
        this.isValidatingCredentials = false;
        this.translateService.use('en');
    }
    ngOnInit(): void {
        // Add line below temporary to fix lint problem (Remove it later)
        return;
    }

    changeLanguage(language: string) {
        this.translateService.use(language);
    }
    async login() {
        this.isValidatingCredentials = true;
        const response = await this.auth.login(this.email, this.password).toPromise();
        if (!this.auth.anErrorOccurred()) {
            this.clearErrorMessage();
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
                preferences: body?.preferences as unknown as UserPreferences,
                themes: body?.themes as string[],
                friends: body?.friends as string[],
            });
            this.translateService.use(body?.preferences?.language || 'en');
        } else {
            this.createErrorMessage();
            this.isValidatingCredentials = false;
            return;
        }
    }
    // TODO remove this when the game is over
    async hardcodedLogin(email: string, password: string) {
        this.signUpForm.controls.email.setValue(email);
        this.signUpForm.controls.password.setValue(password);
        await this.login();
    }

    createErrorMessage() {
        switch (this.auth.statusCode) {
            case HttpStatusCode.Conflict:
                this.errorMessage = 'Vous êtes déjà connecté sur un autre appareil. Veuillez vous déconnecter de cet appareil pour avoir accès';
                break;
            case HttpStatusCode.Unauthorized:
                this.errorMessage = 'Identifiants invalides.';
                break;

            default:
                this.errorMessage = 'Vous ne pouvez vous connecter pour le moment. Veuillez réessayer plus tard.';
                break;
        }
    }

    clearErrorMessage() {
        this.errorMessage = '';
    }

    private get email(): string {
        return (this.signUpForm.controls.email as FormControl).value;
    }
    private get password(): string {
        return (this.signUpForm.controls.password as FormControl).value;
    }
}
