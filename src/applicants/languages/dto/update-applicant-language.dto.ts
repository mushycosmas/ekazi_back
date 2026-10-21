 import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicantLanguageDto } from './create-applicant-language.dto';

export class UpdateApplicantLanguageDto extends PartialType(
  CreateApplicantLanguageDto,
) {}