import { Component, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ElectronWindowsCommunicationService } from '@app/electron-windows-communication.service';
import { DataToMainWindow } from '@app/interfaces/electron-windows-communication';
import { PseudoService } from '@app/pseudo.service';

@Component({
    selector: 'app-create-private-conversation',
    templateUrl: './create-private-conversation.component.html',
    styleUrls: ['./create-private-conversation.component.scss'],
})
export class CreatePrivateConversationComponent {
    friends: string[];
    searchText: string;
    constructor(
        @Inject(MAT_DIALOG_DATA) friends: string[],
        private dialogRef: MatDialogRef<CreatePrivateConversationComponent>,
        private ngZone: NgZone,
        private loggedUser: PseudoService,
        private electronService: ElectronWindowsCommunicationService,
    ) {
        this.friends = friends;
        this.searchText = '';
    }
    // https://stackoverflow.com/a/59502797
    close() {
        this.ngZone.run(() => {
            this.dialogRef.close();
        });
    }

    // joinChannel(channelName: string) {
    //     const data: DataToMainWindow = {
    //         socketEventToSend: 'join-channel',
    //         socketEventDataToSend: { email: this.loggedUser.email, name: channelName },
    //     };
    //     this.electronService.sendSocketEventToMainWindow(data);
    //     this.close();
    // }

    createConversation(username: string) {
        const data: DataToMainWindow = {
            socketEventToSend: 'create-private-conversation',
            socketEventDataToSend: { email: this.loggedUser.email, friendUsername: username },
        };
        this.electronService.sendSocketEventToMainWindow(data);
        this.close();
    }

    // socket.on('create-private-conversation', (data: { email: string; friendUsername: string }) => {
    //     this.chatService.createPrivateConversation(socket, data.email, data.friendUsername);
    // });

    getFriendsMatchingFilter(): string[] {
        if (!this.searchText || !this.searchText.length) return this.friends;
        return this.friends.filter((res: string) => {
            return res.match(this.searchText);
        });
    }
}
