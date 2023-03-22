import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    isChatConfigured: boolean;
    constructor() {
        this.isChatConfigured = false;
    }

    isSocketAlive(): boolean {
        return this.socket && this.socket.connected;
    }

    connect() {
        if (this.isSocketAlive()) return;
        this.socket = io(environment.serverUrl.replace('/api', ''), { transports: ['websocket'], upgrade: false });
        // console.log(`connecting the socket ${this.socket.id}`);
        this.isChatConfigured = false;
    }

    disconnect() {
        // console.log(`disconecting the socket ${this.socket.id}`);
        this.socket.disconnect();
        this.isChatConfigured = false;
    }

    on<T>(event: string, action: (data: T) => void) {
        // console.log(event);
        // console.log(action);
        this.socket.on(event, action);
    }
    remove(event: string) {
        this.socket.removeAllListeners(event);
    }

    send<T>(event: string, data?: T) {
        // console.log(event);
        // console.log(data);
        if (data) {
            this.socket.emit(event, data);
        } else {
            this.socket.emit(event);
        }
    }
}
