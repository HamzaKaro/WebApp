/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PUBLICITY_COINS_REWARD } from '@app/constants/shop';
import { ErrorDialogComponent } from '@app/error-dialog/error-dialog.component';
import { HttpUserDataService } from '@app/http-user-data.service';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { PseudoService } from '@app/pseudo.service';

@Component({
    selector: 'app-video-publicity',
    templateUrl: './video-publicity.component.html',
    styleUrls: ['./video-publicity.component.scss'],
})
export class VideoPublicityComponent implements OnInit {
    @Input() videoPath: string; // ex : assets/videos/tractor.mp4
    @ViewChild('ad', { static: false }) ad: ElementRef<HTMLVideoElement>;

    isVideoCompleted: boolean;
    rewardClaimed: boolean;
    videoCurrentTime: number;
    constructor(private userService: PseudoService, private http: HttpUserDataService, private loggedUser: PseudoService, private dialog: MatDialog) {
        this.isVideoCompleted = false;
        this.rewardClaimed = false;
        this.videoCurrentTime = 0;
    }

    handleVideoEnding() {
        this.isVideoCompleted = true;
    }

    async claimReward() {
        await this.http.addCoins(this.loggedUser.email, PUBLICITY_COINS_REWARD).toPromise();
        if (!this.http.anErrorOccurred()) {
            this.userService.coins += PUBLICITY_COINS_REWARD;
            this.rewardClaimed = true;
            // TODO Add a fancy popup to say that he received his coins
        } else {
            this.openErrorDialog(this.http.getErrorMessage());
        }
    }
    openErrorDialog(errorMessage: string) {
        this.dialog.open(ErrorDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: errorMessage,
        });
    }
    ngOnInit(): void {
        return;
    }
    // https://stackoverflow.com/a/34384315
    handleTimeUpdate(event: any) {
        if (this.ad !== null && this.ad.nativeElement.seeking !== undefined && !this.ad.nativeElement.seeking) {
            this.videoCurrentTime = event.target.currentTime;
        }
    }
    preventSkippingTime() {
        if (!this.ad.nativeElement || this.ad.nativeElement.seeking === undefined) {
            return;
        }
        const timeDelta = this.ad.nativeElement.currentTime - this.videoCurrentTime;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (Math.abs(timeDelta) > 0.01) {
            this.ad.nativeElement.currentTime = this.videoCurrentTime;
        }
    }
}
