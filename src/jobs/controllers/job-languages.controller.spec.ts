import { Test, TestingModule } from '@nestjs/testing';
import { JobLanguagesController } from './job-languages.controller';

describe('JobLanguagesController', () => {
  let controller: JobLanguagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobLanguagesController],
    }).compile();

    controller = module.get<JobLanguagesController>(JobLanguagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
