import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicantRefereeDto } from './create-applicant-referee.dto';

export class UpdateApplicantRefereeDto extends PartialType(
  CreateApplicantRefereeDto,
) {}