import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnexionsHistoryComponent } from './connexions-history.component';

describe('ConnexionsHistoryComponent', () => {
    let component: ConnexionsHistoryComponent;
    let fixture: ComponentFixture<ConnexionsHistoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConnexionsHistoryComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConnexionsHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
