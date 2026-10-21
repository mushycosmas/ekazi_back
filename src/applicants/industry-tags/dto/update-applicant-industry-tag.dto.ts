import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicantIndustryTagDto } from './create-applicant-industry-tag.dto';

export class UpdateApplicantIndustryTagDto extends PartialType(
  CreateApplicantIndustryTagDto,
) {}