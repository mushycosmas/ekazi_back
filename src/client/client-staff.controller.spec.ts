import { Test, TestingModule } from '@nestjs/testing';
import { ClientStaffController } from './client-staff.controller';

describe('ClientStaffController', () => {
  let controller: ClientStaffController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientStaffController],
    }).compile();

    controller = module.get<ClientStaffController>(ClientStaffController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
