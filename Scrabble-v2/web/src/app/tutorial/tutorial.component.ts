import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SoundService } from '@app/services/sound.service';

export interface TutorialStep {
    imageURL: string;
    imageAlt: string;
    titleTranslationKey?: string;
    descriptionTranslationKey?: string;
}
const tutorialSteps: TutorialStep[] = [
    {
        imageURL: 'assets/tutorial/horizontalPlacement.png',
        imageAlt: 'logo de Google',
        titleTranslationKey: 'tutorial.titles.word_placement',
        descriptionTranslationKey: 'tutorial.descriptions.word_placement',
    },
    {
        imageURL: 'assets/tutorial/board2.png',
        imageAlt: 'logo de Google',
        titleTranslationKey: 'tutorial.titles.red_tile',
        descriptionTranslationKey: 'tutorial.descriptions.red_tile',
    },
    {
        imageURL: 'assets/tutorial/board2.png',
        imageAlt: 'logo de Google',
        titleTranslationKey: 'tutorial.titles.blue_tile',
        descriptionTranslationKey: 'tutorial.descriptions.blue_tile',
    },

    {
        imageURL: 'assets/tutorial/accents.png',
        imageAlt: 'logo de Google',
        titleTranslationKey: 'tutorial.titles.letter_without_accent',
        descriptionTranslationKey: 'tutorial.descriptions.letter_without_accent',
    },

    {
        imageURL: 'assets/tutorial/end_game.png',
        imageAlt: 'logo de Google',
        titleTranslationKey: 'tutorial.titles.end_game',
        descriptionTranslationKey: 'tutorial.descriptions.end_game',
    },

    {
        imageURL: 'assets/tutorial/wildcard.png',
        imageAlt: 'logo de Google',
        titleTranslationKey: 'tutorial.titles.special_letters',
        descriptionTranslationKey: 'tutorial.descriptions.special_letters',
    },
    {
        imageURL: 'assets/tutorial/points.png',
        imageAlt: 'logo de Google',
        titleTranslationKey: 'tutorial.titles.letter_points',
        descriptionTranslationKey: 'tutorial.descriptions.letter_points',
    },
    // {
    //     imageURL: 'assets/tutorial/horizontalPlacement.png',
    //     imageAlt: 'logo de Google',
    //     titleTranslationKey: 'tutorial.titles.keyboard_placement',
    //     descriptionTranslationKey: 'tutorial.descriptions.keyboard_placement',
    // },
    {
        imageURL: 'assets/tutorial/drag.png',
        imageAlt: 'logo de Google',
        titleTranslationKey: 'tutorial.titles.drag',
        descriptionTranslationKey: 'tutorial.descriptions.drag',
    },
    {
        imageURL: 'assets/tutorial/scoreInterface.png',
        imageAlt: 'logo de Google',
        titleTranslationKey: 'tutorial.titles.score',
        descriptionTranslationKey: 'tutorial.descriptions.score',
    },
    {
        imageURL: 'assets/tutorial/timerInterface.png',
        imageAlt: 'logo de Google',
        titleTranslationKey: 'tutorial.titles.timer',
        descriptionTranslationKey: 'tutorial.descriptions.timer',
    },
    {
        imageURL: 'assets/tutorial/exchangeInterface.png',
        imageAlt: 'search',
        titleTranslationKey: 'tutorial.titles.switch_letters',
        descriptionTranslationKey: 'tutorial.descriptions.switch_letters',
    },

    {
        imageURL: 'assets/tutorial/horizontalPlacement.png',
        imageAlt: 'search',
        titleTranslationKey: 'tutorial.titles.placement',
        descriptionTranslationKey: 'tutorial.descriptions.placement',
    },
    {
        imageURL: 'assets/tutorial/giveUpInterface.png',
        imageAlt: 'search',
        titleTranslationKey: 'tutorial.titles.give_up',
        descriptionTranslationKey: 'tutorial.descriptions.give_up',
    },
    {
        imageURL: 'assets/tutorial/skipTurnInterface.png',
        imageAlt: 'search',
        titleTranslationKey: 'tutorial.titles.skip_turn',
        descriptionTranslationKey: 'tutorial.descriptions.skip_turn',
    },
    {
        imageURL: 'assets/tutorial/boardInterface.png',
        imageAlt: 'search',
        titleTranslationKey: 'tutorial.titles.board',
        descriptionTranslationKey: 'tutorial.descriptions.board',
    },
    {
        imageURL: 'assets/tutorial/chat.png',
        imageAlt: 'search',
        titleTranslationKey: 'tutorial.titles.chat',
        descriptionTranslationKey: 'tutorial.descriptions.chat',
    },
    {
        imageURL: 'assets/tutorial/searchDefinitions.png',
        imageAlt: 'search',
        titleTranslationKey: 'tutorial.titles.search_definition',
        descriptionTranslationKey: 'tutorial.descriptions.search_definition',
    },
];
@Component({
    selector: 'app-tutorial',
    templateUrl: './tutorial.component.html',
    styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent implements OnInit {
    currentStep: number;
    steps: TutorialStep[];
    constructor(private dialogRef: MatDialogRef<TutorialComponent>, private soundService: SoundService) {
        this.currentStep = 0;
        this.steps = tutorialSteps;
    }
    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    nextStep() {
        this.currentStep++;
    }

    previousStep() {
        this.currentStep--;
    }

    isOver(): boolean {
        return this.currentStep === this.steps.length - 1;
    }
    ngOnInit(): void {
        // Add line below temporary to fix lint problem (Remove it later)
        return;
    }

    close() {
        this.dialogRef.close();
    }
}
