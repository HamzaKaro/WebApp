import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinChannelDialogComponent } from './join-channel-dialog.component';

describe('JoinChannelDialogComponent', () => {
    let component: JoinChannelDialogComponent;
    let fixture: ComponentFixture<JoinChannelDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinChannelDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinChannelDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
