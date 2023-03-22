import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePrivateConversationComponent } from './create-private-conversation.component';

describe('CreatePrivateConversationComponent', () => {
    let component: CreatePrivateConversationComponent;
    let fixture: ComponentFixture<CreatePrivateConversationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreatePrivateConversationComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreatePrivateConversationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
