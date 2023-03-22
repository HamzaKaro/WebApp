import { Injectable } from '@angular/core';
import { SOUNDS_MAP } from '@app/constants/sounds-constant';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    turnOn: boolean = true;
    controllerSound(typeSound: string): void {
        const audio = new Audio();
        audio.src = './assets/sound_effects/' + SOUNDS_MAP.get(typeSound);
        audio.load();
        if (this.turnOn) {
            audio.volume = 0.1;
            audio.play();
        } else {
            audio.pause();
            audio.currentTime = 0;
        }
    }
}
