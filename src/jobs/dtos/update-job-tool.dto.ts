import { PartialType } from '@nestjs/mapped-types';
import { CreateJobToolDto } from './create-job-tool.dto';

export class UpdateJobToolDto extends PartialType(
  CreateJobToolDto,
) {}