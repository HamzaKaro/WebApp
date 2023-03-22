import { Room } from '@app/classes/room-model/room';

export interface Invitation {
    emailSender: string;
    usernameSender: string;
    usernameReceiver: string;
    emailReceiver: string;
    room: Room;
}
