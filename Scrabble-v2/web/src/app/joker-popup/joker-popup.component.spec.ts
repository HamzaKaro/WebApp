import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JokerPopupComponent } from './joker-popup.component';

describe('JokerPopupComponent', () => {
    let component: JokerPopupComponent;
    let fixture: ComponentFixture<JokerPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JokerPopupComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JokerPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
