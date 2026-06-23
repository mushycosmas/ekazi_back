import { Test, TestingModule } from '@nestjs/testing';
import { JobReportTosController } from './job-report-tos.controller';

describe('JobReportTosController', () => {
  let controller: JobReportTosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobReportTosController],
    }).compile();

    controller = module.get<JobReportTosController>(JobReportTosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
