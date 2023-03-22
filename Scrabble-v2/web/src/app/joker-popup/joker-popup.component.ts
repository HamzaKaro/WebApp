import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
    selector: 'app-joker-popup',
    templateUrl: './joker-popup.component.html',
    styleUrls: ['./joker-popup.component.scss'],
})
export class JokerPopupComponent implements OnInit {
    jokerForm: FormGroup;

    constructor(@Inject(MAT_DIALOG_DATA) private targetId: number, private fb: FormBuilder, private dialogRef: MatDialogRef<JokerPopupComponent>) {
        this.jokerForm = this.fb.group({
            joker: ['', [Validators.required, Validators.pattern('^[a-zA-Z]$|^(À|à|Â|â|Ç|ç|É|é|È|è|Ê|ê|Ë|ë|Î|î|Ï|ï|Ô|ô|Ù|ù|Û|û|Ü|ü|Ÿ|ÿ)$')]],
        });
    }

    ngOnInit(): void {
        return;
    }

    get joker(): FormControl {
        return this.jokerForm.controls.joker as FormControl;
    }

    isJokerValid(): boolean {
        return this.joker.valid;
    }
    getJokerWithoutDiacritics(): string {
        return this.joker.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    registerJoker() {
        this.dialogRef.close({ joker: this.getJokerWithoutDiacritics().toLowerCase(), targetId: this.targetId });
    }
    close() {
        this.dialogRef.close('');
    }
}
