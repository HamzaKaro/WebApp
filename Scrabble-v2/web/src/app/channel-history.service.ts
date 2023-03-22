import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UNDELETABLE_CHANNEL_NAME } from './constants/channels';
import { Channel } from './interfaces/create-channel-dto';
import { ChatMessage } from './services/message';

export const MAX_ROOM_CHANNELS = 100;
@Injectable({
    providedIn: 'root',
})
export class ChannelHistoryService {
    viewingChannel: string;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    messages: Subject<ChatMessage[]> = new Subject<ChatMessage[]>();
    channelsHistory: Map<Channel, ChatMessage[]>;
    private channels: Map<string, Channel>;
    constructor() {
        this.viewingChannel = '';
        this.channelsHistory = new Map<Channel, ChatMessage[]>();
        this.channels = new Map<string, Channel>();
        this.initDefaultChannel();
    }
    // TODO (David) remove this hardcoding part
    // TODO remove this when this will be on the server
    initDefaultChannel() {
        const defaultChannel: Channel = {
            creator: ';;;;;;',
            name: UNDELETABLE_CHANNEL_NAME,
            isPublic: true,
            participants: [],
            creationDate: new Date(),
            messages: [],
        };
        this.channels.set(defaultChannel.name, defaultChannel);
        this.channelsHistory.set(defaultChannel, []);
    }
    getAllChannels(): string[] {
        const channelNames: string[] = [];
        [...this.channelsHistory.keys()].forEach((channel: Channel) => {
            channelNames.push(channel.name);
        });
        return channelNames;
    }
    getChannel(channelName: string): Channel | undefined {
        for (const [key] of this.channelsHistory) {
            // Channel already exist
            if (key.name === channelName) return key;
        }
        return undefined;
    }
    addChannel(channel: Channel) {
        if (!channel || !channel.name) return;
        if (this.channels.get(channel.name)) return;
        this.channels.set(channel.name, channel);
        if (channel.messages !== undefined) {
            this.channelsHistory.set(channel, channel.messages);
            return;
        }
        this.channelsHistory.set(channel, []);
    }

    // TODO rename to removeViewingChannel
    removeChannel(channelName: string) {
        const channel: Channel | undefined = this.channels.get(channelName);
        if (!channel) return;
        this.channelsHistory.delete(channel);
        this.channels.delete(channelName);
    }

    getChannelMessages(): ChatMessage[] {
        const channel = this.channels.get(this.viewingChannel);
        if (!channel) return [];
        const messages = this.channelsHistory.get(channel);
        if (!messages) return [];
        return messages;
    }
    addMessage(message: ChatMessage) {
        this.getChannelMessages()?.push(message);
    }
    addMessageToChannel(channelName: string, message: ChatMessage) {
        const channel = this.channels.get(channelName);
        if (!channel || !message.text || message.text.trim() === '') return;
        const messages = this.channelsHistory.get(channel);
        if (!messages) return;
        messages.push(message);
        this.channelsHistory.set(channel, messages);
        // this.messages = this.channelsHistory.get(channel);
        this.messages.next(this.channelsHistory.get(channel));
    }

    clearChannelsHistory() {
        this.channelsHistory = new Map<Channel, ChatMessage[]>();
        this.initDefaultChannel();
    }
    removeAllRoomChannels() {
        for (let index = 0; index < MAX_ROOM_CHANNELS; index++) {
            this.removeChannel(`Room${index}`);
        }
    }
}
