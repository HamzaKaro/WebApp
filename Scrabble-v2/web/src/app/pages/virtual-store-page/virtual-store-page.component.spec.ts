import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualStorePageComponent } from './virtual-store-page.component';

describe('VirtualStorePageComponent', () => {
    let component: VirtualStorePageComponent;
    let fixture: ComponentFixture<VirtualStorePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VirtualStorePageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VirtualStorePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
