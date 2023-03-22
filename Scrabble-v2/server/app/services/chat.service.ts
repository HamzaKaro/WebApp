/* eslint-disable max-lines */
import { UserService } from '@app/services/user.service';
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-console */
import { Channel, CreateChannelDto, Message } from '@app/interfaces/chat';
import {
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    QueryDocumentSnapshot,
    setDoc,
} from 'firebase/firestore/lite';
import { Server, Socket } from 'socket.io';
import { DateService } from './date.service';
import { Firebase } from './firebase.service';

export class ChatService {
    channelsRef: CollectionReference;
    usersRef: CollectionReference;
    constructor(private firebase: Firebase, private sio: Server, private usersService: UserService) {
        this.channelsRef = collection(this.firebase.dbStore(), 'channels');
        this.usersRef = collection(this.firebase.dbStore(), 'users');
    }

    async broadcastMessageInChannel(message: Message, socket: Socket) {
        if (!socket.rooms.has(message.destination)) return;
        let timestamp = '';
        try {
            timestamp = DateService.getMontrealTimestamp();
        } catch (error) {
            // Utiliser la vieille implementation qui nous donne un temps off parfois
            timestamp = new DateService().getTimestamp();
        }

        const content = `${message.text}\n${timestamp}`;
        const sentMessage = { ...message, text: content };
        socket.to(message.destination).emit('message', sentMessage);
        socket.emit('message', sentMessage);
        socket.emit('messageReceived');
        this.saveMessageInChannel(sentMessage);
    }

    async saveMessageInChannel(message: Message) {
        try {
            const channelRef = doc(this.channelsRef, message.destination);
            const channelDoc = await getDoc(channelRef);
            if (channelDoc.exists()) {
                const channelData = channelDoc.data() as Channel;
                if (!channelData.isPublic) {
                    channelData.messages.push(message);
                    await setDoc(channelRef, channelData);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    async createChannel(
        channelDto: CreateChannelDto,
        socket: Socket,
        data?: { canBeLeft: boolean; canBeDeleted: boolean; displayName: string },
    ): Promise<boolean> {
        try {
            // Check if channel already exists
            const channelDoc = doc(this.channelsRef, channelDto.name);
            const channel = (await (await getDoc(channelDoc)).data()) as Channel;
            if (channel) {
                socket.emit('create-channel', { code: 409, message: 'Channel already exists' });
                this.joinChannel({ name: channelDto.name, email: channelDto.creator, socket });
                return false;
            } // Channel already exists

            const channelToCreate = {
                ...channelDto,
                creationDate: new Date(),
                messages: [],
                participants: [],
            };
            return await setDoc(channelDoc, channelToCreate)
                .then(() => {
                    console.log(`Channel '${channelDto.name}' created`);
                    console.log(data);
                    // Add the user to the channel if created successfully
                    this.joinChannel({ email: channelDto.creator, socket, name: channelDto.name, data });
                    socket.emit('create-channel', {
                        code: 200,
                        name: channelDto.name,
                        creator: channelDto.creator,
                        isPublic: channelDto.isPublic,
                        message: 'Channel created successfully',
                    });

                    return true;
                })
                .catch((error) => {
                    console.error(error);
                    return false;
                });
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async leaveChannel({ name, email, socket }: { name: string; email: string; socket: Socket }) {
        try {
            const channelDoc = doc(this.channelsRef, name);
            const channelData = (await (await getDoc(channelDoc))?.data()) as Channel;

            // Remove the user from the channel
            if (!channelData) {
                // Channel doesn't exist
                socket.emit('leave-channel', { code: 404, message: 'Channel not found' });
                return false;
            }
            const newParticipants = channelData.participants?.filter((participant) => participant !== email);
            await setDoc(channelDoc, { ...channelData, participants: newParticipants });

            const userDoc = doc(this.usersRef, email);
            const userData = await (await getDoc(userDoc))?.data();

            // Remove the channel from the user's document
            if (!userData) {
                // User doesn't exist
                socket.emit('leave-channel', { code: 404, name: channelData.name, message: 'User not found' });
                return false;
            }
            const newChannels = userData.channels.filter((channel: string) => channel !== name);
            await setDoc(userDoc, { ...userData, channels: newChannels });
            socket.leave(name);
            socket.emit('leave-channel', { code: 200, name, message: 'Left channel successfully' });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async deleteChannel(name: string, email: string, socket: Socket) {
        try {
            // Communicate with the DB
            const channelsRef = collection(this.firebase.dbStore(), 'channels');

            // Check if the user is the creator of the channel
            const userDoc = doc(this.usersRef, email);
            const userData = await (await getDoc(userDoc))?.data();
            if (!userData) return false;

            const channelDoc = doc(channelsRef, name);
            if (!(await getDoc(channelDoc)).exists()) {
                socket.emit('delete-channel', { code: 404, message: 'Channel not found' });
                return false;
            }
            const channelData = (await (await getDoc(channelDoc))?.data()) as Channel;
            if (channelData.creator !== email) {
                socket.emit('delete-channel', { code: 401, name, message: 'User is not the creator of the channel' });
                return false;
            }

            // Get all the users in the channel
            // Delete channel reference in the document of all users that were in
            // TODO: Remove all sockets from the channel
            const participants = channelData.participants;
            for (const participant of participants) {
                const userD = doc(this.usersRef, participant);
                const data = await (await getDoc(userD))?.data();
                if (!data) continue;
                const newChannels = data.channels.filter((channel: string) => channel !== name);
                await setDoc(userDoc, { ...data, channels: newChannels });
            }
            this.sio.sockets.in(name).emit('delete-channel', { code: 200, name, message: `Channel '${name}' deleted` });
            this.sio.sockets.in(name).socketsLeave(name);

            // Delete the channel document

            return deleteDoc(channelDoc)
                .then(() => {
                    console.log(`Channel '${name}' deleted`);
                    socket.emit('delete-channel', { code: 200, name, message: 'Channel deleted successfully' });
                    return true;
                })
                .catch((error) => {
                    console.error(error);
                    return false;
                });
        } catch (e) {
            console.error(e);
            socket.emit('delete-channel', { code: 500, message: 'Internal server error' });
            return false;
        }
    }

    async addUserToChannelDB({ name, email }: { name: string; email: string }) {
        try {
            // Add the user in the channel's document (collection)
            const channelDoc = doc(this.channelsRef, name);
            const channelData = (await (await getDoc(channelDoc))?.data()) as Channel;
            if (!channelData) return false;

            // Add the user to the channel
            if (!channelData.participants) channelData.participants = [];
            const newParticipants = [...channelData.participants, email];
            await setDoc(channelDoc, { ...channelData, participants: Array.from(new Set(newParticipants)) });

            // Add the channel in the user's document
            const userDoc = doc(this.usersRef, email);
            const userData = await (await getDoc(userDoc))?.data();
            if (!userData) return false;
            if (userData.channels.includes(name)) {
                return true;
            }
            const newChannels = [...userData.channels, name];
            await setDoc(userDoc, { ...userData, channels: newChannels });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async joinChannel({
        email,
        socket,
        name,
        data,
    }: {
        email: string;
        socket: Socket;
        name: string;
        data?: { canBeLeft: boolean; canBeDeleted: boolean; displayName: string };
    }) {
        try {
            // Add the user in the channel's document (collection)
            const channelDoc = doc(this.channelsRef, name);
            const channelData = (await (await getDoc(channelDoc))?.data()) as Channel;
            if (!channelData) return false;

            // Add the user to the channel
            if (!channelData.participants) channelData.participants = [];
            const newParticipants = [...channelData.participants, email];
            await setDoc(channelDoc, { ...channelData, participants: Array.from(new Set(newParticipants)) });

            // Add the channel in the user's document
            const userDoc = doc(this.usersRef, email);
            const userData = await (await getDoc(userDoc))?.data();
            if (!userData) return false;
            if (userData.channels.includes(name)) {
                socket.emit('join-channel', { code: 200, name, message: 'User was already in channel.' });
                return true;
            }
            const newChannels = [...userData.channels, name];
            await setDoc(userDoc, { ...userData, channels: newChannels });

            // Join the channel
            socket.join(name);
            socket.emit('join-channel', {
                code: 200,
                name,
                creator: channelData.creator,
                isPublic: channelData.isPublic,
                message: 'Channel joined successfully',
                ...data,
            });
            console.log(`Channel '${name}' joined by '${email}'`);
            return true;
        } catch (e) {
            console.error(e);
            socket.emit('join-channel', { code: 400, message: 'Error while joining channel' });
            return false;
        }
    }

    async getChannels(): Promise<Channel[]> {
        try {
            const channels = await getDocs(this.channelsRef);
            return (channels.docs.map((doc) => doc.data()) as Channel[]).filter((channel) => channel.isPublic);
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async createPrivateConversation(socket: Socket, creatorEmail: string, friendUsername: string) {
        try {
            const creator = await this.usersService.getUser(creatorEmail);
            const friend = await this.usersService.getUserByUsername(friendUsername);

            if (!friend || !creator) {
                socket.emit('create-private-conversation', { code: 404, message: 'Creator or Friend not found' });
                return false;
            }
            const conversationName = `MP:${creatorEmail}:${friend.email}`;
            const channelCreated = await this.createChannel({ name: conversationName, isPublic: false, creator: creatorEmail }, socket, {
                displayName: friend?.username ? `${friend?.username} (mp)` : conversationName,
                canBeDeleted: false,
                canBeLeft: false,
            });
            if (!channelCreated) return false;
            if (this.usersService.authedSockets.has(friendUsername)) {
                const authedFriend = this.usersService.authedSockets.get(friendUsername);
                this.joinChannel({
                    email: friend.email,
                    socket: authedFriend?.socket as Socket,
                    name: conversationName,
                    data: {
                        displayName: creator?.username ? `${creator?.username} (mp)` : conversationName,
                        canBeDeleted: false,
                        canBeLeft: false,
                    },
                });
            }
            await this.addUserToChannelDB({ name: conversationName, email: friend.email });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async getUserChannels(email: string, socket: Socket): Promise<Channel[]> {
        const channelSnapList = new Set<QueryDocumentSnapshot<DocumentData>>();
        try {
            const user = await getDoc(doc(this.usersRef, email));
            if (!user.exists()) {
                socket.emit('get-user-channels', { code: 404, message: 'User not found' });
                return [];
            }
            for (const channel of user.data()?.channels) {
                const channelRef = doc(this.channelsRef, channel);
                const channelSnap = await getDoc(channelRef);
                if (!channelSnap.exists()) continue;
                socket.join(channel);
                channelSnapList.add(channelSnap);
            }
            const data = (await Promise.all(
                Array.from(channelSnapList).map(async (channelSnap) => {
                    const channelData = channelSnap.data() as Channel;
                    if (!channelData.isPublic && channelData.name.startsWith('MP:')) {
                        const parts = channelData.name.split(':').splice(1);
                        const friendEmail = parts.find((part) => part !== email);
                        let friend = null;
                        if (friendEmail) friend = await this.usersService.getUser(friendEmail);

                        return {
                            ...channelData,
                            canBeDeleted: false,
                            canBeLeft: false,
                            displayName: friend?.username ? `${friend?.username} (mp)` : channelData.name,
                        };
                    }
                    return channelData;
                }),
            )) as Channel[];

            return data;
        } catch (e) {
            console.error(e);
            return [];
        }
    }
}
