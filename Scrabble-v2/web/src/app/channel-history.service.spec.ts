import { TestBed } from '@angular/core/testing';

import { ChannelHistoryService } from './channel-history.service';

describe('ChannelHistoryService', () => {
    let service: ChannelHistoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChannelHistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
