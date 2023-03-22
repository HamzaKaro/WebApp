import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoPublicityComponent } from './video-publicity.component';

describe('VideoPublicityComponent', () => {
    let component: VideoPublicityComponent;
    let fixture: ComponentFixture<VideoPublicityComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VideoPublicityComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VideoPublicityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
