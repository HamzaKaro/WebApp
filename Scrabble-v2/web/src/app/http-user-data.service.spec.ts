import { TestBed } from '@angular/core/testing';

import { HttpUserDataService } from './http-user-data.service';

describe('HttpUserDataService', () => {
    let service: HttpUserDataService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HttpUserDataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
