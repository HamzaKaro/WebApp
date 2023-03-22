import { Injectable, HostBinding } from '@angular/core';
import { PseudoService } from '@app/pseudo.service';
import { ThemeService } from '@app/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { DataToChatWindow } from '@app/interfaces/electron-windows-communication';
import { ElectronWindowsCommunicationService } from './electron-windows-communication.service';
@Injectable({
    providedIn: 'root',
})
export class PreferencesLoaderService {
    @HostBinding('class') componentCssClass: unknown;

    constructor(
        private themeService: ThemeService,
        private translateService: TranslateService,
        private loggedUser: PseudoService,
        private electronService: ElectronWindowsCommunicationService,
    ) {}

    loadUserPreferences() {
        this.loadUserLanguage();
        this.loadUserTheme();
    }

    loadUserTheme() {
        this.themeService.setTheme(this.loggedUser.preferences.theme);
        this.componentCssClass = this.loggedUser.preferences.theme;
    }
    loadUserLanguage() {
        this.translateService.use(this.loggedUser.preferences.language);
    }

    setPreferencesInChatWindow() {
        const dataForChatWindow: DataToChatWindow = {
            electronEvent: 'change-preferences',
            electronEventData: this.loggedUser.preferences,
        };
        this.electronService.sendEventToChatWindow(dataForChatWindow);
    }
}
