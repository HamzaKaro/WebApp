/* eslint-disable @typescript-eslint/no-explicit-any */
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Room } from '@app/classes/room';
import { Score } from '@app/classes/score';
import { FriendlistComponent } from '@app/components/friendlist/friendlist.component';
import { LeaderboardDialogDataComponent } from '@app/components/leaderboard-dialog-data/leaderboard-dialog-data.component';
import { SettingsComponent } from '@app/components/settings/settings.component';
import { ElectronWindowsCommunicationService } from '@app/electron-windows-communication.service';
import { ErrorDialogComponent } from '@app/error-dialog/error-dialog.component';
import { HttpService } from '@app/http.service';
import { DataToChatWindow } from '@app/interfaces/electron-windows-communication';
import { Rating } from '@app/interfaces/rating';
import { JokerPopupComponent } from '@app/joker-popup/joker-popup.component';
import { PseudoService } from '@app/pseudo.service';
import { SoundService } from '@app/services/sound.service';
import { ThemeService } from '@app/theme.service';
import { TutorialComponent } from '@app/tutorial/tutorial.component';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

export const LEADERBOARD_SIZE = 5;
export const DIALOG_WIDTH = '600px';
// declare let electron: any;

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss', '../dark-theme.scss'],
})
export class MainPageComponent implements OnInit {
    @HostBinding('class') componentCssClass: unknown;
    isDarkMode: boolean = true;
    otherTheme: boolean = false;
    title: string;
    message: BehaviorSubject<string>;
    ratingsAverage: number;
    form5: FormGroup;

    constructor(
        private fb: FormBuilder,
        public overlayContainer: OverlayContainer,
        public room: Room,
        private dialog: MatDialog,
        public loggedUser: PseudoService,
        private httpService: HttpService,
        private soundService: SoundService,
        private pseudoService: PseudoService,
        private themeService: ThemeService, // private socketService: SocketClientService, // private invitationService: InvitationService,
        private electronService: ElectronWindowsCommunicationService,
    ) {
        this.form5 = this.fb.group({
            rating: [0],
        });
        this.title = 'LOG2990';
        this.message = new BehaviorSubject<string>('');
        this.ratingsAverage = 0;
        this.soundService.turnOn = loggedUser.preferences?.soundAnimations;
        if (loggedUser.preferences?.theme !== undefined && loggedUser.preferences?.theme != null) this.onSetTheme(loggedUser.preferences?.theme);
    }

    async ngOnInit() {
        await this.getRatingsAverage();
        const dataForChatWindow: DataToChatWindow = {
            electronEvent: 'remove-all-room-channels',
            electronEventData: [],
        };
        this.electronService.sendEventToChatWindow(dataForChatWindow);
    }

    userIsAdmin() {
        return this.pseudoService.isAdmin;
    }

    onSetTheme(theme: string) {
        this.themeService.setTheme(theme);
        this.componentCssClass = theme;
    }

    setGameType(type: string) {
        this.room.roomInfo.gameType = type;
    }

    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    openTutorial() {
        this.dialog.open(TutorialComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
        });
    }

    openSettings() {
        this.dialog.open(SettingsComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
        });
    }

    openFriendlist() {
        this.dialog.open(FriendlistComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
        });
    }

    async getRatingsAverage() {
        const rating: Rating = await this.httpService.getRatingsAverage().toPromise();
        if (this.httpService.anErrorOccurred()) {
            this.showErrorDialog();
            return;
        }
        this.ratingsAverage = rating.average;
        // this.form.value.rating = 5;
        this.form5.controls.rating.setValue(Math.round(this.ratingsAverage));
    }
    async showLeaderboard() {
        const scores = await this.getLeaderboardScores();
        if (this.httpService.anErrorOccurred()) {
            this.showErrorDialog();
            return;
        }
        this.dialog.open(LeaderboardDialogDataComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: scores,
        });
    }

    openJoker() {
        const dialog = this.dialog.open(JokerPopupComponent, {
            width: '300px',
            autoFocus: true,
        });

        // Commentaire pour Marie
        // Voici comment on va récuperer le joke
        dialog.afterClosed().subscribe((joker) => {
            alert(joker);
        });
    }

    async showAllScores() {
        const scores = await this.httpService.fetchAllScores().toPromise();
        if (!scores) {
            this.showErrorDialog();
            return;
        }
        this.dialog.open(LeaderboardDialogDataComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: [scores],
        });
    }
    private async getLeaderboardScores(): Promise<Score[][] | undefined> {
        const scores: Score[][] = [];
        for (const gameMode of ['log2990', 'classic']) {
            const score = await this.httpService.getNScoresByCategory(gameMode, LEADERBOARD_SIZE).toPromise();
            if (!score) return undefined;
            scores.push(score);
        }
        return scores;
    }
    private showErrorDialog() {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: this.httpService.getErrorMessage(),
        });
    }
}
