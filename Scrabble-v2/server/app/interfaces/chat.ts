export interface Channel {
    creator: string;
    name: string; // serves as the ID
    isPublic: boolean;
    participants: string[]; // TODO define a type
    creationDate: Date;
    messages: Message[]; // TODO define a type
    displayName?: string;
    canBeDeleted?: boolean;
    canBeLeft?: boolean;
}

export interface CreateChannelDto {
    creator: Channel['creator'];
    name: Channel['name'];
    isPublic: Channel['isPublic'];
}

export interface Message {
    text: string;
    destination: string;
    sender: string;
    avatar: string;
    timestamp: string;
}

export interface ChatMessage {
    text: string;
    sender: string;
    color: string;
    destination: string;
}
