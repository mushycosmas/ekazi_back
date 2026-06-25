import { PartialType } from '@nestjs/mapped-types';
import { CreateJobRequirementDto } from './create-job-requirement.dto';

export class UpdateJobRequirementDto extends PartialType(
  CreateJobRequirementDto,
) {}