import { Component, OnInit } from '@angular/core';
import { Room } from '@app/classes/room';
import { SocketClientService } from '@app/services/socket-client.service';
import { SoundService } from '@app/services/sound.service';

@Component({
    selector: 'app-game-option-page',
    templateUrl: './game-option-page.component.html',
    styleUrls: ['./game-option-page.component.scss', '../dark-theme.scss'],
})
export class GameOptionPageComponent implements OnInit {
    constructor(private socketService: SocketClientService, private soundService: SoundService, public room: Room) {}

    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }
    ngOnInit() {
        // this.disconnect();
        return;
    }

    disconnect() {
        if (this.socketService.isSocketAlive()) {
            // this.socketService.disconnect();
        }
    }
}
