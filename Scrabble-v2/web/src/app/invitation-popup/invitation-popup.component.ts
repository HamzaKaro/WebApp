import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Invitation } from '@app/invite-friends/invite-friends.component';
import { SoundService } from '@app/services/sound.service';

@Component({
    selector: 'app-invitation-popup',
    templateUrl: './invitation-popup.component.html',
    styleUrls: ['./invitation-popup.component.scss'],
})
export class InvitationPopupComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public invitation: Invitation,
        private dialogRef: MatDialogRef<InvitationPopupComponent>,
        private soundService: SoundService,
        private router: Router,
    ) {
        this.invitation = invitation;
    }

    ngOnInit(): void {
        return;
    }
    closeDialog(): void {
        this.dialogRef.close();
    }

    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    accept() {
        this.router.navigate(['/game/multiplayer-friend/join']);
        this.dialogRef.close();
    }
    refuse() {
        this.dialogRef.close();
    }
}
