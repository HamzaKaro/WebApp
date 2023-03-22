/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatService } from '@app/chat.service';
// Validators.minLength(MIN_LENGTH_PASSWORD)
const numberMagicDavid = 20; // Created only for lint
@Component({
    selector: 'app-add-channel-dialog',
    templateUrl: './add-channel-dialog.component.html',
    styleUrls: ['./add-channel-dialog.component.scss'],
})
export class AddChannelDialogComponent implements OnInit {
    channelForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AddChannelDialogComponent>,
        private ngZone: NgZone,
        private chatService: ChatService,
    ) {
        this.channelForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(numberMagicDavid)]],
        });
    }

    ngOnInit(): void {
        return;
    }

    isFormValid() {
        return this.channelName.valid;
    }
    addChannel() {
        this.chatService.addChannel(this.channelName.value);
        this.close();
    }

    get channelName(): FormControl {
        return this.channelForm.controls.name as FormControl;
    }

    close() {
        this.ngZone.run(() => {
            this.dialogRef.close();
        });
    }
}
