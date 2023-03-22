import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ElectronWindowsCommunicationService } from '@app/electron-windows-communication.service';
import { DataToMainWindow } from '@app/interfaces/electron-windows-communication';
import { PseudoService } from '@app/pseudo.service';
// import { SUCCESSFUL_CHANNEL_OPERATION_CODE } from '@app/constants/channels';
// import { PseudoService } from '@app/pseudo.service';
// import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-join-channel-dialog',
    templateUrl: './join-channel-dialog.component.html',
    styleUrls: ['./join-channel-dialog.component.scss'],
})
export class JoinChannelDialogComponent implements OnInit {
    publicChannels: string[];
    searchText: string;
    constructor(
        @Inject(MAT_DIALOG_DATA) channels: string[],
        private dialogRef: MatDialogRef<JoinChannelDialogComponent>,
        private ngZone: NgZone,
        private electronService: ElectronWindowsCommunicationService,
        private loggedUser: PseudoService,
    ) {
        this.publicChannels = channels;
        this.searchText = '';
    }
    ngOnInit(): void {
        return;
    }
    joinChannel(channelName: string) {
        const data: DataToMainWindow = {
            socketEventToSend: 'join-channel',
            socketEventDataToSend: { email: this.loggedUser.email, name: channelName },
        };
        this.electronService.sendSocketEventToMainWindow(data);
        this.close();
    }

    // https://stackoverflow.com/a/59502797
    close() {
        this.ngZone.run(() => {
            this.dialogRef.close();
        });
    }
    getChannelsMatchingFilter(): string[] {
        if (!this.searchText || !this.searchText.length) return this.publicChannels;
        return this.publicChannels.filter((res: string) => {
            return res.match(this.searchText);
        });
    }
}
