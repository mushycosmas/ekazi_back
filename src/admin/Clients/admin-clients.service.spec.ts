import { Test, TestingModule } from '@nestjs/testing';
import { AdminClientsService } from './admin-clients.service';

describe('AdminClientsService', () => {
  let service: AdminClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminClientsService],
    }).compile();

    service = module.get<AdminClientsService>(AdminClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
