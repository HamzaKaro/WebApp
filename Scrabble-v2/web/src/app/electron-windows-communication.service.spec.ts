import { TestBed } from '@angular/core/testing';

import { ElectronWindowsCommunicationService } from './electron-windows-communication.service';

describe('ElectronWindowsCommunicationService', () => {
    let service: ElectronWindowsCommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ElectronWindowsCommunicationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
