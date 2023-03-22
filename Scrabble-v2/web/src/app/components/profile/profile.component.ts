import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChannelHistoryService } from '@app/channel-history.service';
import { ProfilePopupComponent } from '@app/components/profile-popup/profile-popup.component';
import { HttpAuthService } from '@app/http-auth.service';
import { PseudoService } from '@app/pseudo.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { SoundService } from '@app/services/sound.service';
import { ThemeService } from '@app/theme.service';
// TODO (david) use the electron service
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let electron: any;

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
    constructor(
        private loggedUser: PseudoService,
        private auth: HttpAuthService,
        private router: Router,
        private socket: SocketClientService,
        private channelHistory: ChannelHistoryService,
        private dialog: MatDialog,
        public soundService: SoundService,
        private themeService: ThemeService,
    ) {}

    ngOnInit(): void {
        return;
    }

    openPopup(parameterType: string) {
        if (['profile', 'parameters', 'statistics', 'connexions', 'friendlist'].includes(parameterType)) {
            this.dialog.open(ProfilePopupComponent, {
                autoFocus: true,
                panelClass: 'full-screen-modal',
                data: parameterType,
            });
        }

        return parameterType;
    }
    closeChatWindow() {
        if (!electron) return;
        electron.ipcRenderer.send('close-chat-window', '');
    }

    async logout() {
        this.socket.send('logout-socket', this.loggedUser.pseudo);
        this.auth.logout(this.loggedUser.pseudo).toPromise();
        this.router.navigate(['/login']);
        this.loggedUser.disconnect();
        this.themeService.setTheme('light');
        this.socket.disconnect();
        this.channelHistory.clearChannelsHistory();
        this.closeChatWindow();
    }
}
