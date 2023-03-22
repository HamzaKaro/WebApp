import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Room } from './classes/room';
import { InvitationPopupComponent } from './invitation-popup/invitation-popup.component';
import { Invitation } from './invite-friends/invite-friends.component';
import { SocketClientService } from './services/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class InvitationService {
    isInRoom: boolean;
    room: Room;
    constructor(room: Room, private socketService: SocketClientService, private dialog: MatDialog) {
        this.initializeRoom(room);
    }
    initializeRoom(room: Room) {
        // set up
        this.room = room;
        //
    }
    listenInvitation() {
        this.socketService.on('invite-friend', (invitation: Invitation) => {
            if (this.isInRoom) return;
            this.initializeRoom(invitation.room);
            this.dialog.open(InvitationPopupComponent, {
                data: invitation,
            });
        });
    }
}
