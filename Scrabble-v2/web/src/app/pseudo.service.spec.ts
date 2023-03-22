import { TestBed } from '@angular/core/testing';

import { PseudoService } from './pseudo.service';

describe('PseudoService', () => {
    let service: PseudoService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PseudoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
