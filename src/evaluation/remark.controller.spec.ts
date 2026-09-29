import { Test, TestingModule } from '@nestjs/testing';
import { RemarkController } from './remark.controller';

describe('RemarkController', () => {
  let controller: RemarkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemarkController],
    }).compile();

    controller = module.get<RemarkController>(RemarkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
