
import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicantProficiencyDto } from './create-applicant-proficiency.dto';

export class UpdateApplicantProficiencyDto extends PartialType(
  CreateApplicantProficiencyDto,
) {}
