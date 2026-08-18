import { Test, TestingModule } from '@nestjs/testing';
import { ClientStaffPositionsService } from './client-staff-positions.service';

describe('ClientStaffPositionsService', () => {
  let service: ClientStaffPositionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientStaffPositionsService],
    }).compile();

    service = module.get<ClientStaffPositionsService>(ClientStaffPositionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
