import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAvatarPopupComponent } from './upload-avatar-popup.component';

describe('UploadAvatarPopupComponent', () => {
    let component: UploadAvatarPopupComponent;
    let fixture: ComponentFixture<UploadAvatarPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UploadAvatarPopupComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadAvatarPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
