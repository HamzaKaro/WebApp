/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { ElectronWindowsCommunicationService } from '@app/electron-windows-communication.service';
import { Channel, CreateChannelDto } from '@app/interfaces/create-channel-dto';
import { DataToChatWindow, DataToMainWindow } from '@app/interfaces/electron-windows-communication';
import { PseudoService } from '@app/pseudo.service';
import { ChatMessage } from './services/message';
import { SocketClientService } from './services/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(private electron: ElectronWindowsCommunicationService, private loggedUser: PseudoService, private sockets: SocketClientService) {}
    getUserChannels() {
        const data: DataToMainWindow = {
            socketEventToSend: 'get-user-channels',
            socketEventDataToSend: { email: this.loggedUser.email },
        };
        this.electron.sendSocketEventToMainWindow(data);
    }
    getAllChannels() {
        const data: DataToMainWindow = {
            socketEventToSend: 'get-channels-list',
            socketEventDataToSend: {},
        };
        this.electron.sendSocketEventToMainWindow(data);
    }

    leaveChannel(channelName: string) {
        const data: DataToMainWindow = {
            socketEventToSend: 'leave-channel',
            socketEventDataToSend: { email: this.loggedUser.email, name: channelName },
        };
        this.electron.sendSocketEventToMainWindow(data);
    }

    deleteChannel(channelName: string) {
        const data: DataToMainWindow = {
            socketEventToSend: 'delete-channel',
            socketEventDataToSend: { email: this.loggedUser.email, name: channelName },
        };
        this.electron.sendSocketEventToMainWindow(data);
    }

    addChannel(channelName: string) {
        const channel: CreateChannelDto = { creator: this.loggedUser.email, name: channelName, isPublic: true };
        const data: DataToMainWindow = {
            socketEventToSend: 'create-channel',
            socketEventDataToSend: channel,
        };
        this.electron.sendSocketEventToMainWindow(data);
    }

    // This method must be called only once per connection (login)
    /*
    Also, this method must be called on by the main window, because the chat
    window has no socket and a new socket is created everytime we log in
    */
    configureChatSockets() {
        this.sockets.on('message', (roomMessage: ChatMessage) => {
            const dataForChatWindow: DataToChatWindow = {
                electronEvent: 'message',
                electronEventData: roomMessage,
            };
            this.electron.sendEventToChatWindow(dataForChatWindow);
        });
        this.sockets.on('get-channels-list', (channels: Channel[]) => {
            const dataForChatWindow: DataToChatWindow = {
                electronEvent: 'get-channels-list',
                electronEventData: channels,
            };
            this.electron.sendEventToChatWindow(dataForChatWindow);
        });
        this.sockets.on('join-channel', (response: any) => {
            const dataForChatWindow: DataToChatWindow = {
                electronEvent: 'join-channel',
                electronEventData: response,
            };
            this.electron.sendEventToChatWindow(dataForChatWindow);
        });
        this.sockets.on('leave-channel', (response: any) => {
            const dataForChatWindow: DataToChatWindow = {
                electronEvent: 'leave-channel',
                electronEventData: response,
            };
            this.electron.sendEventToChatWindow(dataForChatWindow);
        });
        this.sockets.on('get-user-channels', (response: Channel[]) => {
            const dataForChatWindow: DataToChatWindow = {
                electronEvent: 'get-user-channels',
                electronEventData: response,
            };
            this.electron.sendEventToChatWindow(dataForChatWindow);
        });
        this.sockets.on('delete-channel', (response: any) => {
            const dataForChatWindow: DataToChatWindow = {
                electronEvent: 'delete-channel',
                electronEventData: response,
            };
            this.electron.sendEventToChatWindow(dataForChatWindow);
        });
        this.sockets.on('create-private-conversation', (response: any) => {
            const dataForChatWindow: DataToChatWindow = {
                electronEvent: 'create-private-conversation',
                electronEventData: response,
            };
            this.electron.sendEventToChatWindow(dataForChatWindow);
        });
    }
}
