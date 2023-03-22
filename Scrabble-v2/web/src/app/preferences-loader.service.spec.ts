import { TestBed } from '@angular/core/testing';

import { PreferencesLoaderService } from './preferences-loader.service';

describe('PreferencesLoaderService', () => {
    let service: PreferencesLoaderService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PreferencesLoaderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
