import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadBlogCoverPopupComponent } from './upload-blog-cover-popup.component';

describe('UploadBlogCoverPopupComponent', () => {
    let component: UploadBlogCoverPopupComponent;
    let fixture: ComponentFixture<UploadBlogCoverPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UploadBlogCoverPopupComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadBlogCoverPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
