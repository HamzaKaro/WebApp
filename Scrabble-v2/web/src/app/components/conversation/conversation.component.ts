/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddChannelDialogComponent } from '@app/add-channel-dialog/add-channel-dialog.component';
import { ChannelHistoryService, MAX_ROOM_CHANNELS } from '@app/channel-history.service';
import { ChatService } from '@app/chat.service';
import { CreatePrivateConversationComponent } from '@app/components/create-private-conversation/create-private-conversation.component';
import { JoinChannelDialogComponent } from '@app/components/join-channel-dialog/join-channel-dialog.component';
import {
    DELETE_CHANNEL_ERROR,
    GET_ALL_CHANNELS_ERROR,
    LEAVE_CHANNEL_ERROR,
    SUCCESSFUL_CHANNEL_OPERATION_CODE,
    UNDELETABLE_CHANNEL_NAME,
} from '@app/constants/channels';
import { DEFAULT_MESSAGE } from '@app/constants/http-constants';
import { ElectronWindowsCommunicationService } from '@app/electron-windows-communication.service';
import { HttpUserDataService } from '@app/http-user-data.service';
import { Channel } from '@app/interfaces/create-channel-dto';
import { UserPreferences } from '@app/interfaces/user';
import { DIALOG_WIDTH } from '@app/pages/main-page/main-page.component';
import { PreferencesLoaderService } from '@app/preferences-loader.service';
import { PseudoService } from '@app/pseudo.service';
import { ChatMessage } from '@app/services/message';

declare let electron: any;
@Component({
    selector: 'app-conversation',
    templateUrl: './conversation.component.html',
    styleUrls: ['./conversation.component.scss'],
})
export class ConversationComponent implements OnInit {
    isChatOpen: boolean;
    isViewingChannel: boolean;
    viewingChannel: string;

    constructor(
        public channelService: ChannelHistoryService,
        private pseudoService: PseudoService,
        private dialog: MatDialog,
        private ngZone: NgZone,
        private changeDetector: ChangeDetectorRef,
        private chatService: ChatService,
        private electronService: ElectronWindowsCommunicationService,
        private http: HttpUserDataService,
        private preferencesLoader: PreferencesLoaderService,
    ) {
        this.isChatOpen = true;
        this.viewChannelsList();
        this.configureChatProcess();
        this.getUserInfo();
    }

    // Enregistre les informations obtenus du mainWindow
    configureChatProcess() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!electron) return;
        electron.ipcRenderer.on(
            'set-user-info',
            (_event: any, data: { pseudo: string; email: string; avatar: string; theme: string; preferences: UserPreferences }) => {
                this.pseudoService.pseudo = data.pseudo;
                this.pseudoService.email = data.email;
                this.pseudoService.avatar = data.avatar;
                this.pseudoService.preferences = data.preferences;
                this.preferencesLoader.loadUserPreferences();
                this.getUserChannels();
            },
        );
        electron.ipcRenderer.on('message', (_event: any, roomMessage: any) => {
            const message: ChatMessage = { text: roomMessage.text, sender: roomMessage.sender, avatar: roomMessage.avatar };
            this.channelService.addMessageToChannel(roomMessage.destination, message);
        });
        electron.ipcRenderer.on('join-channel', (_event: any, channelFromServer: any) => {
            if (!channelFromServer.code) return;
            const channel: Channel = channelFromServer;
            this.channelService.addChannel(channel);
            this.refresh();
        });
        electron.ipcRenderer.on('get-channels-list', (_event: any, response: any) => {
            if (!response.length) {
                this.openErrorDialog(GET_ALL_CHANNELS_ERROR);
                return;
            }
            // https://stackoverflow.com/a/42744090
            this.ngZone.run(() => {
                const channelNames: string[] = [];
                response.forEach((channel: Channel) => {
                    if (!channel.participants) return;
                    if (!channel.isPublic || channel.participants.includes(this.pseudoService.email)) return;
                    channelNames.push(channel.name);
                });
                this.openJoinChannelDialog(channelNames);
            });
        });
        electron.ipcRenderer.on('leave-channel', (_event: any, response: any) => {
            if (!response.code || response.code !== SUCCESSFUL_CHANNEL_OPERATION_CODE) {
                const errorMessage = response.message ? response.message : LEAVE_CHANNEL_ERROR;
                this.openErrorDialog(errorMessage);
                return;
            }
            this.channelService.removeChannel(response.name);
            if (this.viewingChannel === response.name) {
                this.viewChannelsList();
            }
            this.refresh();
        });

        electron.ipcRenderer.on('get-user-channels', (_event: any, response: any) => {
            response.forEach((channel: Channel) => {
                this.channelService.addChannel(channel);
            });
            this.refresh();
        });
        electron.ipcRenderer.on('redirect-channel-created-response-to-chat-window', (_event: any, response: any) => {
            this.channelService.addChannel(response);
            this.refresh();
        });
        electron.ipcRenderer.on('delete-channel', (_event: any, response: any) => {
            if (response.code !== SUCCESSFUL_CHANNEL_OPERATION_CODE) {
                const errorMessage = response.message ? response.message : DELETE_CHANNEL_ERROR;
                this.openErrorDialog(errorMessage);
                return;
            }
            this.channelService.removeChannel(response.name);
            this.viewChannelsList();
            this.refresh();
        });
        electron.ipcRenderer.on('change-theme', (_event: any, theme: string) => {
            this.ngZone.run(() => {
                this.pseudoService.preferences.theme = theme;
                this.preferencesLoader.loadUserTheme();
            });
        });
        electron.ipcRenderer.on('change-language', (_event: any, language: string) => {
            this.ngZone.run(() => {
                this.pseudoService.preferences.language = language;
                this.preferencesLoader.loadUserLanguage();
            });
        });
        // Event received when the user saves his settings
        electron.ipcRenderer.on('change-preferences', (_event: any, preferences: UserPreferences) => {
            this.ngZone.run(() => {
                this.pseudoService.preferences = preferences;
                this.preferencesLoader.loadUserPreferences();
            });
        });

        electron.ipcRenderer.on('update-avatar-and-pseudo', (_event: any, data: { pseudo: string; avatar: string }) => {
            this.ngZone.run(() => {
                this.pseudoService.pseudo = data.pseudo;
                this.pseudoService.avatar = data.avatar;
            });
        });
        electron.ipcRenderer.on('remove-all-room-channels', (_event: any, language: string) => {
            this.ngZone.run(() => {
                this.channelService.removeAllRoomChannels();
                if (this.isViweingRoomChannel()) {
                    this.viewChannelsList();
                }
            });
        });
    }
    ngOnInit(): void {
        return;
    }

    toggleChat() {
        this.isChatOpen = !this.isChatOpen;
    }
    // Demande au mainRenderer (mainWindow) les informations de l'utilisateur sur le site
    getUserInfo() {
        electron.ipcRenderer.send('get-user-info', {});
    }

    async openCreatePrivateConversationDialog() {
        try {
            const friendsResponse = await this.http.getUncontactedFriends(this.pseudoService.email).toPromise();
            if (this.http.anErrorOccurred()) {
                this.openErrorDialog(this.http.getErrorMessage());
                return;
            }
            this.ngZone.run(() => {
                this.dialog.open(CreatePrivateConversationComponent, {
                    width: DIALOG_WIDTH,
                    autoFocus: true,
                    data: friendsResponse.body,
                });
                return;
            });
        } catch (error) {
            this.openErrorDialog(DEFAULT_MESSAGE);
        }
    }

    // By calling that we hope to receive 'get-friends' back from the mainWindow
    getFriends() {
        this.electronService.sendEvent('get-friends', {});
    }
    // ***** CHANNELS HANDLING ***** //
    getUserChannels() {
        this.chatService.getUserChannels();
    }
    getAllChannels() {
        this.chatService.getAllChannels();
    }

    leaveChannel() {
        this.chatService.leaveChannel(this.viewingChannel);
    }

    deleteChannel() {
        this.chatService.deleteChannel(this.viewingChannel);
    }
    addChannel() {
        const dialog = this.dialog.open(AddChannelDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
        });
        // TODO do something with it ?
        dialog.afterClosed().subscribe(async (result) => {
            if (!result) return;
        });
    }

    enterChannel(channelName: string) {
        this.viewingChannel = channelName;
        this.channelService.viewingChannel = channelName;
        this.isViewingChannel = true;
    }

    viewChannels() {
        this.isViewingChannel = false;
    }

    isChannelDeletable(): boolean {
        const channel = this.channelService.getChannel(this.viewingChannel);
        if (!channel) return false;
        if (this.viewingChannel === UNDELETABLE_CHANNEL_NAME) return false;
        if (channel.canBeDeleted !== undefined) return channel.canBeDeleted;
        if (channel.creator === this.pseudoService.email) return true;
        return false;
    }

    isChannelLeaveable(): boolean {
        const channel = this.channelService.getChannel(this.viewingChannel);
        if (!channel) return false;
        if (this.viewingChannel === UNDELETABLE_CHANNEL_NAME) return false;
        if (channel.canBeLeft !== undefined) return channel.canBeLeft;
        if (channel.creator === this.pseudoService.email) return false;
        return true;
    }
    openJoinChannelDialog(publicChannels: string[]) {
        this.dialog.open(JoinChannelDialogComponent, {
            width: DIALOG_WIDTH,
            height: '400px',
            autoFocus: true,
            data: publicChannels,
        });
    }
    getChannelDisplayName(channelName: string) {
        const channel: Channel | undefined = this.channelService.getChannel(channelName);
        if (channel === undefined) return channelName;
        return channel.displayName !== undefined ? channel.displayName : channelName;
    }

    private openErrorDialog(errorMessage: string) {
        this.dialog.open(JoinChannelDialogComponent, {
            width: DIALOG_WIDTH,
            autoFocus: true,
            data: errorMessage,
        });
    }
    private viewChannelsList() {
        this.isViewingChannel = false;
        this.viewingChannel = '';
    }
    private refresh() {
        this.ngZone.run(() => {
            this.changeDetector.detectChanges();
        });
    }
    private isViweingRoomChannel() {
        for (let index = 0; index < MAX_ROOM_CHANNELS; index++) {
            if (this.viewingChannel === `Room${index}`) {
                return true;
            }
        }
        return false;
    }
}
