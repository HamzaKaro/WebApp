import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChannelHistoryService } from '@app/channel-history.service';
import { HttpAuthService } from '@app/http-auth.service';
import { PseudoService } from '@app/pseudo.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { SoundService } from '@app/services/sound.service';

const MAX_PSEUDO_LENGTH = 100;
const MIN_PSEUDO_LENGTH = 5;
// Do not remove this eslint disable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let electron: any;

@Component({
    selector: 'app-pseudo-input',
    templateUrl: './pseudo-input.component.html',
    styleUrls: ['./pseudo-input.component.scss'],
})
export class PseudoInputComponent implements OnInit {
    form: FormGroup;
    isPseudoSet: boolean; // was the pseudo set by the user, so we don't need to reprompt him
    errorMessage: string;
    constructor(
        private fb: FormBuilder,
        private pseudoService: PseudoService,
        private auth: HttpAuthService,
        private router: Router,
        private socket: SocketClientService,
        private channelHistory: ChannelHistoryService,
        private soundService: SoundService,
    ) {
        this.form = this.fb.group({
            pseudo: ['', [Validators.required, Validators.minLength(MIN_PSEUDO_LENGTH), Validators.maxLength(MAX_PSEUDO_LENGTH)]],
        });
        this.isPseudoSet = false;
    }

    ngOnInit(): void {
        // Add line below temporary to fix lint problem (Remove it later)
        return;
    }
    get pseudo(): string {
        return this.pseudoService.pseudo;
    }

    closeChatWindow() {
        if (!electron) return;
        electron.ipcRenderer.send('close-chat-window', '');
    }

    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    async logout() {
        await this.auth.logout(this.pseudoService.pseudo).toPromise();
        if (!this.auth.anErrorOccurred()) {
            this.router.navigate(['/login']);
            this.pseudoService.disconnect();
            this.socket.disconnect();
            this.channelHistory.clearChannelsHistory();
            this.closeChatWindow();
            // TODO (david) add more stuff
        } else {
            return;
        }
    }
}
