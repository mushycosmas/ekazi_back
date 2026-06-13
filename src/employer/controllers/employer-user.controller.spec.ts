import { Test, TestingModule } from '@nestjs/testing';
import { EmployerUserController } from './employer-user.controller';

describe('EmployerUserController', () => {
  let controller: EmployerUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerUserController],
    }).compile();

    controller = module.get<EmployerUserController>(EmployerUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
