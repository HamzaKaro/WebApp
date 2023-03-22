import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservedPlayAreaComponent } from './observed-play-area.component';

describe('ObservedPlayAreaComponent', () => {
    let component: ObservedPlayAreaComponent;
    let fixture: ComponentFixture<ObservedPlayAreaComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ObservedPlayAreaComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ObservedPlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
