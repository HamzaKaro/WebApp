import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PreferencesLoaderService } from '@app/preferences-loader.service';

@Component({
    selector: 'app-profile-popup',
    templateUrl: './profile-popup.component.html',
    styleUrls: ['./profile-popup.component.scss'],
})
export class ProfilePopupComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public pageToDisplay: string,
        private dialogRef: MatDialogRef<ProfilePopupComponent>,
        private preferencesLoader: PreferencesLoaderService,
    ) {}
    close() {
        if (this.pageToDisplay === 'parameters') {
            /*
            Closing the popup with the 'x' on the parameters page, means the preferences were not saved.
            However, everytime we change the language or the theme, we give a preview to the user
            by changing the theme and the language on the whole app. If we do not save, we do not want
            those changes to stay.
            */
            this.preferencesLoader.loadUserPreferences();
            this.preferencesLoader.setPreferencesInChatWindow();
        }
        this.dialogRef.close();
    }
}
