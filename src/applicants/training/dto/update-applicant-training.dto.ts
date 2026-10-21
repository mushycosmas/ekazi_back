import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicantTrainingDto } from './create-applicant-training.dto';

export class UpdateApplicantTrainingDto extends PartialType(
  CreateApplicantTrainingDto,
) {}