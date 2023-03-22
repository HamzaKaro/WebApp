import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationPopupComponent } from './invitation-popup.component';

describe('InvitationPopupComponent', () => {
    let component: InvitationPopupComponent;
    let fixture: ComponentFixture<InvitationPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InvitationPopupComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InvitationPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
