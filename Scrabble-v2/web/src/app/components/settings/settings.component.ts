import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { LISTE_THEMES } from '@app/constants/themes-constants';
import { ElectronWindowsCommunicationService } from '@app/electron-windows-communication.service';
import { HttpUserDataService } from '@app/http-user-data.service';
import { DataToChatWindow } from '@app/interfaces/electron-windows-communication';
import { UserPreferences } from '@app/interfaces/user';
import { PreferencesLoaderService } from '@app/preferences-loader.service';
import { PseudoService } from '@app/pseudo.service';
import { SoundService } from '@app/services/sound.service';
import { ThemeService } from '@app/theme.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
    @HostBinding('class') componentCssClass: unknown;
    settingsForm: FormGroup;
    language: string;
    theme: string;
    visualAnimations: boolean;
    soundAnimations: boolean;
    userPreferences: UserPreferences;
    themes: string[] = LISTE_THEMES;

    constructor(
        public overlayContainer: OverlayContainer,
        public loggedUser: PseudoService,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<SettingsComponent>,
        private soundService: SoundService,
        private http: HttpUserDataService,
        private themeService: ThemeService,
        private translateService: TranslateService,
        private electronService: ElectronWindowsCommunicationService,
        private preferencesLoader: PreferencesLoaderService,
    ) {
        this.settingsForm = this.fb.group({
            theme: ['', Validators.required],
            language: ['', Validators.required],
            soundAnimations: [loggedUser.preferences.soundAnimations, Validators.required],
            visualAnimations: [loggedUser.preferences.visualAnimations, Validators.required],
        });
        this.userPreferences = JSON.parse(JSON.stringify(this.loggedUser.preferences)); // Deep copy the preferences
        this.language = this.userPreferences.language;
        this.theme = this.userPreferences.theme;
        this.visualAnimations = this.userPreferences.visualAnimations;
        this.soundAnimations = this.userPreferences.soundAnimations;
        if (loggedUser.themes !== undefined && loggedUser.themes.length > 0) this.themes = this.themes.concat(loggedUser.themes);
    }

    ngOnInit(): void {
        return;
    }

    onSetTheme(theme: string) {
        this.themeService.setTheme(theme);
        this.componentCssClass = theme;
    }

    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    changeTheme() {
        const theme = this.settingsForm.value.theme;
        this.theme = theme;
        this.userPreferences.theme = theme;
        this.onSetTheme(theme);
        const dataForChatWindow: DataToChatWindow = {
            electronEvent: 'change-theme',
            electronEventData: theme,
        };
        this.electronService.sendEventToChatWindow(dataForChatWindow);
    }

    changeLanguage() {
        const language = this.settingsForm.value.language;
        this.language = language;
        this.userPreferences.language = language;
        this.translateService.use(language || 'fr');
        const dataForChatWindow: DataToChatWindow = {
            electronEvent: 'change-language',
            electronEventData: language,
        };
        this.electronService.sendEventToChatWindow(dataForChatWindow);
    }

    soundAnimationsOnChange() {
        this.soundAnimations = !this.soundAnimations;
        this.soundService.turnOn = this.soundAnimations;
        this.userPreferences.soundAnimations = this.soundAnimations;
    }
    visualAnimationsOnChange() {
        this.visualAnimations = !this.visualAnimations;
        this.userPreferences.visualAnimations = this.visualAnimations;
    }

    async saveSettings() {
        this.loggedUser.preferences = this.userPreferences;
        await this.http.updateSettings(this.loggedUser.email, this.userPreferences).toPromise();
        this.close();
    }

    close() {
        this.preferencesLoader.setPreferencesInChatWindow();
        this.dialogRef.close();
    }
}
