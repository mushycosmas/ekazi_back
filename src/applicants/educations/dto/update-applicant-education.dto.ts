 import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicantEducationDto } from './create-applicant-education.dto';

export class UpdateApplicantEducationDto extends PartialType(
  CreateApplicantEducationDto,
) {}