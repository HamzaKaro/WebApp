/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { DataToChatWindow, DataToMainWindow } from './interfaces/electron-windows-communication';
import { PseudoService } from './pseudo.service';
import { SocketClientService } from './services/socket-client.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let electron: any;
@Injectable({
    providedIn: 'root',
})
export class ElectronWindowsCommunicationService {
    isElectronRunning: boolean;
    constructor(private userService: PseudoService, private sockets: SocketClientService) {
        this.isElectronRunning = electron ? true : false;
        this.configureElectronToReceiveMessagesFromChatWindow();
    }

    // Anything send here will be forwarded to the main window
    sendSocketEventToMainWindow(data: DataToMainWindow) {
        this.sendEvent('socket-event-to-main-window', data);
    }
    // Anything send here will be forwarded to the chat window
    sendEventToChatWindow(data: DataToChatWindow) {
        this.sendEvent('redirect-electron-event-to-chat-window', data);
    }

    // This is sent to the main.js. It will not be forwarded to the chatWindow or the mainWindow necessarily.
    // It depends on the implementation of the event
    sendEvent(eventName: string, data: any) {
        if (!this.isElectronRunning) return;
        electron.ipcRenderer.send(eventName, data);
    }

    // This method must only be called once in the whole application.
    // Otherwise, the mainWindow could end up sending multiple times the same socket event
    private configureElectronToReceiveMessagesFromChatWindow() {
        if (!this.isElectronRunning) return;
        electron.ipcRenderer.on('get-friends-to-chat-window', () => {
            const data: DataToChatWindow = {
                electronEvent: 'get-friends',
                electronEventData: this.userService.friends,
            };
            this.sendEventToChatWindow(data);
        });
        electron.ipcRenderer.on('socket-event-to-main-window', (_event: any, data: any) => {
            if (data.socketEventToSend === 'create-channel') {
                data.socketEventDataToSend.creator = this.userService.email;
            } else if (data.socketEventToSend === 'leave-channel') {
                const channelName = data.socketEventDataToSend.name;
                data.socketEventDataToSend = { email: this.userService.email, name: channelName };
            }
            this.sockets.send(data.socketEventToSend, data.socketEventDataToSend);
        });
    }
}
