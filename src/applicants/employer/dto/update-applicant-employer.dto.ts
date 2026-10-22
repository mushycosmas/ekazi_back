import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicantEmployerDto } from './create-applicant-employer.dto';

export class UpdateApplicantEmployerDto extends PartialType(
  CreateApplicantEmployerDto,
) {}