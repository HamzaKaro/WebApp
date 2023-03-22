import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Room } from '@app/classes/room';
import { Friend, FriendsService } from '@app/friends.service';
import { PseudoService } from '@app/pseudo.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { SoundService } from '@app/services/sound.service';
export interface Invitation {
    emailSender: string;
    usernameSender: string;
    usernameReceiver: string;
    emailReceiver: string;
    room: Room;
}

@Component({
    selector: 'app-invite-friends',
    templateUrl: './invite-friends.component.html',
    styleUrls: ['./invite-friends.component.scss'],
})
export class InviteFriendsComponent implements OnInit, AfterViewInit {
    invitationForm: FormGroup;
    friendsUsername: string[];
    friendStatus: string[];
    availableFriends: Friend[];
    selected: Friend;
    indexSelected: string;
    hasFriend: boolean;
    constructor(
        private loggedUser: PseudoService,
        private fb: FormBuilder,
        private friendService: FriendsService,
        private soundService: SoundService,
        private socketService: SocketClientService,
        @Inject(MAT_DIALOG_DATA) private room: Room,
        private dialogRef: MatDialogRef<InviteFriendsComponent>,
    ) {
        this.hasFriend = true;
        this.invitationForm = this.fb.group({
            invitedFriend: ['', Validators.required],
        });
    }
    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    async ngOnInit(): Promise<void> {
        await this.friendService.init();
        this.friendsUsername = this.friendService.friendsUsername.value;
        this.friendStatus = this.friendService.friendsStatus;
        this.availableFriends = this.friendService.getAvailableFriends();
        this.selected = this.availableFriends[this.availableFriends.length - 1];
        this.hasFriend = !(this.availableFriends.length <= 0);
    }

    ngAfterViewInit() {
        this.hasFriend = !(this.availableFriends.length <= 0);
    }

    onChange() {
        this.selected = this.invitationForm.get('invitedFriend')?.value;
    }

    async inviteFriend() {
        const invitation = {
            emailSender: this.loggedUser.email,
            emailReceiver: this.selected.email,
            room: this.room,
            usernameSender: this.loggedUser.pseudo,
            usernameReceiver: this.selected.username,
        };
        this.socketService.send('send-invitation', invitation);
        this.dialogRef.close();
    }
}
