import { Test, TestingModule } from '@nestjs/testing';
import { JobMetasController } from './job-metas.controller';

describe('JobMetasController', () => {
  let controller: JobMetasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobMetasController],
    }).compile();

    controller = module.get<JobMetasController>(JobMetasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
