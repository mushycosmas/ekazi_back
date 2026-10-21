
import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicantPositionDto } from './create-applicant-position.dto';

export class UpdateApplicantPositionDto extends PartialType(
  CreateApplicantPositionDto,
) {}
