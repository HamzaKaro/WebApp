/* eslint-disable */
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SUCCESSFUL_CHANNEL_OPERATION_CODE } from '@app/constants/channels';
import { HttpUserDataService } from '@app/http-user-data.service';
import { PseudoService } from '@app/pseudo.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { SoundService } from '@app/services/sound.service';
import { BehaviorSubject } from 'rxjs/';

@Component({
    selector: 'app-friendlist',
    templateUrl: './friendlist.component.html',
    styleUrls: ['./friendlist.component.scss'],
})
export class FriendlistComponent implements OnInit {
    @ViewChild('load') load: ElementRef;
    user: PseudoService;
    @Input()
    friendsEmail = new BehaviorSubject<string[]>([]);
    @Input()
    friendsUsername = new BehaviorSubject<string[]>([]);
    friendlistForm: FormGroup;
    connectedUsers = new BehaviorSubject<string[]>([]);
    errorMessage: string;
    friendsStatus: string[];
    activeUsers = new BehaviorSubject<string[]>([]);
    usersInGame = new BehaviorSubject<string[]>([]);
    private data: any;
    readonly data$;
    constructor(
        public loggedUser: PseudoService,
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<FriendlistComponent>,
        private soundService: SoundService,
        private http: HttpUserDataService,
        private socket: SocketClientService,
        private changeDetector: ChangeDetectorRef,
    ) {
        this.friendlistForm = this.fb.group({
            usernameToAdd: [''],
        });
        this.friendsStatus = [];
        this.user = loggedUser;
        this.friendsEmail.next(loggedUser.friends);
        this.data = new BehaviorSubject(this.friendsUsername);
        this.data$ = this.data.asObservable();
        this.friendsEmail.subscribe();
        this.friendsUsername.subscribe();
        this.activeUsers.subscribe();
    }

    async ngOnInit(): Promise<void> {
        const result = await this.http.getFriends(this.loggedUser.email).toPromise();
        this.hideloader();
        this.friendsUsername.next(result.body);
        await this.getUsersInGame();
        await this.getActiveUser();
        this.setStatusFriends();
        return;
    }

    ngAfterViewChecked() {
        this.updateActiveUser();
        this.changeDetector.detectChanges();
    }
    playSound(typeSound: string) {
        this.soundService.controllerSound(typeSound);
    }

    async removeFriend(emailToRemove: string) {
        console.log('Email to remove: ' + emailToRemove);
        await this.http.removeFriend(this.loggedUser.email, emailToRemove).toPromise();
        this.refresh();
        confirm("L'utilisateur a ete retire a votre liste d'amis");
        return;
    }

    async addFriend() {
        if (this.usernameToAdd === this.loggedUser.pseudo) {
            this.errorMessage = 'ajout impossible';
            return;
        }
        try {
            await this.http.addFriend(this.loggedUser.email, this.usernameToAdd).toPromise();
            this.errorMessage = this.http.getErrorMessage();
            if (this.http.getErrorMessage() !== '') {
                this.errorMessage = 'erreur ajout';
                return;
            }
            this.refresh();
            alert("L'utilisateur a ete ajoute a votre liste d'amis");
            return;
        } catch (e) {
            this.errorMessage = 'Utilisateur introuvable';
        }
    }

    async refresh() {
        this.friendlistForm.controls.usernameToAdd.reset();
        const getUserResult = await this.http.getUser(this.loggedUser.email).toPromise();
        this.loggedUser = getUserResult.body;
        const getFriendsResult = await this.http.getFriends(this.loggedUser.email).toPromise();
        this.friendsUsername.next(getFriendsResult.body);
        this.user = this.loggedUser;
        this.friendsEmail.next(this.loggedUser.friends);
        this.setStatusFriends();
        this.changeDetector.detectChanges();
        this.errorMessage = '';
    }

    async getActiveUser() {
        const response = await this.http.getActiveUsers().toPromise();
        this.activeUsers.next(response.body as string[]);
    }

    async getUsersInGame() {
        const response = await this.http.getUsersInGame().toPromise();
        this.usersInGame.next(response.body as string[]);
    }

    updateActiveUser() {
        this.socket.on('active-user-modified', (response: any) => {
            if (response.code !== SUCCESSFUL_CHANNEL_OPERATION_CODE) {
            }
            this.activeUsers.next(response.message);
            this.setStatusFriends();
            this.changeDetector.detectChanges();
        });

        this.socket.on('users-in-game', (response: any) => {
            if (response.code !== SUCCESSFUL_CHANNEL_OPERATION_CODE) {
            }
            this.usersInGame.next(response.message);
            this.setStatusFriends();
            this.changeDetector.detectChanges();
        });
    }

    close() {
        this.dialogRef.close();
    }

    isError(): boolean {
        return this.errorMessage === '';
    }

    private get usernameToAdd(): string {
        return (this.friendlistForm.controls.usernameToAdd as FormControl).value;
    }

    clearErrorMessage() {
        this.errorMessage = '';
    }

    setStatusFriends() {
        this.friendsStatus = [];
        this.friendsUsername.value.forEach((username) => {
            this.friendsStatus.push(this.getStatus(username));
        });
    }

    getStatus(username: string) {
        if (this.usersInGame.value.includes(username)) return 'Busy';
        else if (this.activeUsers.value.includes(username)) return 'Online';
        else return 'Offline';
    }

    hideloader() {
        this.load.nativeElement.style.display = 'none';
    }
}
/* eslint-disable */
