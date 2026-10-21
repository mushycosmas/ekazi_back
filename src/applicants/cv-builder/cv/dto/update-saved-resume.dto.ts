import { PartialType } from '@nestjs/mapped-types';
import { CreateSavedResumeDto } from './create-saved-resume.dto';

export class UpdateSavedResumeDto extends PartialType(
  CreateSavedResumeDto,
) {}