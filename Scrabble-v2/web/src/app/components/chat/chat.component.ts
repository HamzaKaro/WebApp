import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChannelHistoryService } from '@app/channel-history.service';
import { CurrentFocus } from '@app/classes/current-focus';
import { MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH } from '@app/constants/constants';
import { ElectronWindowsCommunicationService } from '@app/electron-windows-communication.service';
import { DataToMainWindow } from '@app/interfaces/electron-windows-communication';
import { PseudoService } from '@app/pseudo.service';
import { FocusHandlerService } from '@app/services/focus-handler.service';
import { ChatMessage } from '@app/services/message';
export const SCRABBLE_MESSAGE = '(っ◔◡◔)っ 👑 scrabble 👑';
@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    chatForm: FormGroup;
    isEmojiPickerActive: boolean;

    constructor(
        private focusHandlerService: FocusHandlerService,
        private fb: FormBuilder,
        private pseudoService: PseudoService,
        private channelHistory: ChannelHistoryService,
        private electronService: ElectronWindowsCommunicationService,
    ) {
        this.chatForm = this.fb.group({
            message: ['', [Validators.required, Validators.minLength(MIN_MESSAGE_LENGTH), Validators.maxLength(MAX_MESSAGE_LENGTH)]],
        });
        this.isEmojiPickerActive = false;
    }

    // ngOnInit() {
    //     // let isFirstReload = true;

    //     // this.focusHandlerService.currentFocus.subscribe(() => {
    //     //     if (!this.focusHandlerService.isCurrentFocus(CurrentFocus.CHAT)) {
    //     //         this.closeEmojiPicker();
    //     //         return;
    //     //     }
    //     //     this.messageInput.nativeElement.focus();
    //     // });
    //     // this.focusHandlerService.clientChatMessage.subscribe((message: string) => {
    //     //     if (isFirstReload) {
    //     //         isFirstReload = false;
    //     //         return;
    //     //     }
    //     //     this.addMessage({ text: message, sender: this.pseudoService.pseudo });
    //     // });
    // }

    get message(): FormControl {
        return this.chatForm.controls.message as FormControl;
    }

    sendScrabbleMessage() {
        this.sendToRoom(SCRABBLE_MESSAGE);
        this.closeEmojiPicker();
    }

    handleSubmit() {
        if (!this.chatForm.valid) return;
        if (!this.isMessageValid({ text: this.message.value, sender: this.pseudoService.pseudo })) {
            this.clearMessage();
            return;
        }
        this.sendToRoom(this.message.value);
        this.closeEmojiPicker();
        this.clearMessage();
    }

    sendToRoom(content: string) {
        // console.log('send to room');
        const data: DataToMainWindow = {
            socketEventToSend: 'message',
            socketEventDataToSend: {
                text: content,
                destination: this.channelHistory.viewingChannel,
                sender: this.pseudoService.pseudo,
                avatar: this.pseudoService.avatar,
            },
        };
        this.electronService.sendSocketEventToMainWindow(data);
    }

    updateFocus(event: MouseEvent) {
        event.stopPropagation();
        this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
    }

    openEmojiPicker() {
        if (this.isEmojiPickerActive) {
            this.closeEmojiPicker();
            return;
        }
        this.isEmojiPickerActive = true;
    }

    handleEmojiEvent(emoji: string) {
        const currentText = this.chatForm.controls.message.value;
        this.chatForm.controls.message.setValue(currentText + emoji);
    }

    closeEmojiPicker() {
        if (this.isEmojiPickerActive) {
            this.isEmojiPickerActive = false;
        }
    }

    private isMessageValid(message: ChatMessage): boolean {
        if (this.isTextInvisible(message.text)) return false;
        if (message.sender === '') return false;
        return message.text.length >= MIN_MESSAGE_LENGTH && message.text.length <= MAX_MESSAGE_LENGTH;
    }

    private clearMessage() {
        this.chatForm.controls.message.setValue('');
    }

    private isTextInvisible(text: string) {
        return text.trim() === '';
    }
}
