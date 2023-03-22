import { ChatMessage } from '@app/services/message';

export interface Channel {
    creator: string;
    name: string; // serves as the ID
    isPublic: boolean;
    participants?: string[];
    creationDate?: Date;
    messages?: ChatMessage[];
    canBeLeft?: boolean;
    canBeDeleted?: boolean;
    displayName?: string;
}

export interface CreateChannelDto {
    creator: Channel['creator'];
    name: Channel['name'];
    isPublic: Channel['isPublic'];
}
