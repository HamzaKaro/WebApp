import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PseudoInputComponent } from './pseudo-input.component';

describe('PseudoInputComponent', () => {
    let component: PseudoInputComponent;
    let fixture: ComponentFixture<PseudoInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PseudoInputComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PseudoInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
