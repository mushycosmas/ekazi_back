import { Test, TestingModule } from '@nestjs/testing';
import { JobSettingsController } from './job-settings.controller';

describe('JobSettingsController', () => {
  let controller: JobSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobSettingsController],
    }).compile();

    controller = module.get<JobSettingsController>(JobSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
