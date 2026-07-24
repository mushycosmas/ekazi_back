import { Test, TestingModule } from '@nestjs/testing';
import { ClientStaffService } from './client-staff.service';

describe('ClientStaffService', () => {
  let service: ClientStaffService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientStaffService],
    }).compile();

    service = module.get<ClientStaffService>(ClientStaffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
