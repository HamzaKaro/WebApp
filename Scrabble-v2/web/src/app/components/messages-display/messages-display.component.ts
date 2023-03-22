import { ChangeDetectorRef, Component, ElementRef, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ChannelHistoryService } from '@app/channel-history.service';
import { MessageSenderColors } from '@app/enums/message-sender-colors';
import { Channel } from '@app/interfaces/create-channel-dto';
import { PseudoService } from '@app/pseudo.service';
import { ChatMessage } from '@app/services/message';

import { SYSTEM_NAME } from '@app/components/chat/constants';

@Component({
    selector: 'app-messages-display',
    templateUrl: './messages-display.component.html',
    styleUrls: ['./messages-display.component.scss'],
})
// https://stackoverflow.com/a/59291543
export class MessagesDisplayComponent implements OnInit, OnChanges {
    @ViewChild('scrollMe', { static: true }) private myScrollContainer: ElementRef;
    messagesHistory: ChatMessage[] | undefined;
    msg: Map<Channel, ChatMessage[]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscription: any;
    constructor(private history: ChannelHistoryService, private changeDetector: ChangeDetectorRef, private loggedUser: PseudoService) {
        this.msg = this.history.channelsHistory;
        this.messagesHistory = this.history.getChannelMessages();
        this.subscription = this.history.messages.subscribe((messages) => {
            this.messagesHistory = messages;
            this.changeDetector.detectChanges();
            this.myScrollContainer.nativeElement.click(); // To scroll to bottom
        });
    }
    ngOnChanges(): void {
        this.scrollToBottom();
        return;
    }
    ngOnInit() {
        return;
        // this.scrollToBottom();
        // this.focusHandlerService.currentFocus.subscribe(() => {
        //     return;
        // });
    }
    // updateFocus(event: MouseEvent) {
    //     event.stopPropagation();
    //     this.focusHandlerService.currentFocus.next(CurrentFocus.CHAT);
    // }

    // ngAfterViewChecked() {
    //     this.scrollToBottom();
    //     // this.myScrollContainer.nativeElement.click();
    // }
    isAvatarValid(avatar: string | undefined) {
        if (!avatar || !avatar.length) return false;
        return true;
    }

    scrollToBottom() {
        this.myScrollContainer.nativeElement.scroll = this.myScrollContainer.nativeElement.scrollHeight;
    }

    isMessageFromLoggedUser(message: ChatMessage): boolean {
        return message.sender === this.loggedUser.pseudo;
    }

    getMessageColor(message: ChatMessage): string {
        if (message.sender === SYSTEM_NAME) return MessageSenderColors.SYSTEM;
        return this.isMessageFromLoggedUser(message) ? MessageSenderColors.PLAYER1 : MessageSenderColors.PLAYER2;
    }
}
