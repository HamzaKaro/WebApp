import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingRoomFriendComponent } from './waiting-room-friend.component';

describe('WaitingRoomFriendComponent', () => {
    let component: WaitingRoomFriendComponent;
    let fixture: ComponentFixture<WaitingRoomFriendComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomFriendComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomFriendComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
