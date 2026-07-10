import { Test, TestingModule } from '@nestjs/testing';
import { JobUniversalTypesController } from './job-universal-types.controller';

describe('JobUniversalTypesController', () => {
  let controller: JobUniversalTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobUniversalTypesController],
    }).compile();

    controller = module.get<JobUniversalTypesController>(JobUniversalTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
