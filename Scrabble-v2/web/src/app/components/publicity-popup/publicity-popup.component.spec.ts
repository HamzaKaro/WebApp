import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicityPopupComponent } from './publicity-popup.component';

describe('PublicityPopupComponent', () => {
    let component: PublicityPopupComponent;
    let fixture: ComponentFixture<PublicityPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PublicityPopupComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PublicityPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
