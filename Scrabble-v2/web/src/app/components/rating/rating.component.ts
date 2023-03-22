import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_DURATION_IN_MS } from '@app/constants/constants';
import { MAX_RATING_VALUE, MIN_RATING_VALUE, RATING_COIN_REWARD } from '@app/constants/rating';
import { ErrorDialogComponent } from '@app/error-dialog/error-dialog.component';
import { HttpUserDataService } from '@app/http-user-data.service';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { PseudoService } from '@app/pseudo.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-rating',
    templateUrl: './rating.component.html',
    styleUrls: ['./rating.component.scss'],
})
export class RatingComponent implements OnInit {
    form: FormGroup;
    constructor(
        public loggedUser: PseudoService,
        private fb: FormBuilder,
        private http: HttpUserDataService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private translate: TranslateService,
    ) {
        this.form = this.fb.group({
            rating: ['', Validators.required],
        });
    }
    async sendRating() {
        await this.http.updateRating(this.loggedUser.email, this.form.value.rating).toPromise();
        if (!this.http.anErrorOccurred()) {
            this.loggedUser.rating = this.form.value.rating;
        } else {
            this.openErrorDialog(this.http.getErrorMessage());
        }
    }

    isRatingDone(): boolean {
        const rating = this.loggedUser.rating;
        if (!rating) return false;
        return rating >= MIN_RATING_VALUE && rating <= MAX_RATING_VALUE;
    }

    async claimReward() {
        await this.http.claimRatingReward(this.loggedUser.email).toPromise();
        if (!this.http.anErrorOccurred()) {
            this.loggedUser.receivedRatingReward = true;
            this.loggedUser.coins += RATING_COIN_REWARD;
            this.snackBar.open(this.translate.instant('rating.congrats_message'), this.translate.instant('actions.close'), {
                duration: SNACKBAR_DURATION_IN_MS,
            });
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
}
