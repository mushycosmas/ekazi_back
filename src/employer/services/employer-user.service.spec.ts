import { Test, TestingModule } from '@nestjs/testing';
import { EmployerUserService } from './employer-user.service';

describe('EmployerUserService', () => {
  let service: EmployerUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerUserService],
    }).compile();

    service = module.get<EmployerUserService>(EmployerUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
