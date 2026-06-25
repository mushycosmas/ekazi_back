import { PartialType } from '@nestjs/mapped-types';
import { CreateJobOtherRequirementDto } from './create-job-other-requirement.dto';

export class UpdateJobOtherRequirementDto extends PartialType(
  CreateJobOtherRequirementDto,
) {}