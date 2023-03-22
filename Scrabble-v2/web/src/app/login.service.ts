import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserInformations } from '@app/interfaces/user-informations';
import { PseudoService } from '@app/pseudo.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { ChatService } from './chat.service';
import { InvitationService } from './invitation.service';

// Do not remove this eslint disable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let electron: any;
@Injectable({
    providedIn: 'root',
})
export class LoginService {
    constructor(
        private router: Router,
        private userService: PseudoService,
        private socketService: SocketClientService,
        private chatService: ChatService,
        private invitationService: InvitationService,
    ) {}

    login(userInfos: UserInformations) {
        this.connectSocket();
        this.setUserInformations(userInfos);
        this.openChatWindow();
        this.redirectToHome();
        this.chatService.configureChatSockets();
        this.socketService.send('authentify', this.userService.email);
        this.invitationService.listenInvitation();
    }
    private setUserInformations(userInfos: UserInformations) {
        this.userService.pseudo = userInfos.pseudo;
        this.userService.email = userInfos.email;
        this.userService.rating = userInfos.rating;
        this.userService.receivedRatingReward = userInfos.receivedRatingReward;
        this.userService.avatar = userInfos.avatar;
        this.userService.coins = userInfos.coins;
        this.userService.isAdmin = userInfos.isAdmin || false;
        this.userService.connexions = userInfos.connexions;
        this.userService.deconnexions = userInfos.deconnexions;
        this.userService.preferences = userInfos.preferences;
        this.userService.themes = userInfos.themes;
        this.userService.friends = userInfos.friends;
    }

    private connectSocket() {
        this.socketService.connect();
    }

    private redirectToHome() {
        this.router.navigate(['/home']);
    }

    private openChatWindow() {
        if (!electron) return;
        const userInfo = {
            pseudo: this.userService.pseudo,
            email: this.userService.email,
            avatar: this.userService.avatar,
            preferences: this.userService.preferences,
        };
        electron.ipcRenderer.send('open-chat-window', userInfo);
    }
}
