import { Test, TestingModule } from '@nestjs/testing';
import { ApplicantAddressesController } from './applicant-addresses.controller';

describe('ApplicantAddressesController', () => {
  let controller: ApplicantAddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicantAddressesController],
    }).compile();

    controller = module.get<ApplicantAddressesController>(ApplicantAddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
