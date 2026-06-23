import { Test, TestingModule } from '@nestjs/testing';
import { JobEducationController } from './job-education.controller';

describe('JobEducationController', () => {
  let controller: JobEducationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobEducationController],
    }).compile();

    controller = module.get<JobEducationController>(JobEducationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
