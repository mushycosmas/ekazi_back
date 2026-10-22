import { PartialType } from '@nestjs/mapped-types';
import { CreateExperienceTypeDto } from './create-experience-type.dto';

export class UpdateExperienceTypeDto extends PartialType(
  CreateExperienceTypeDto,
) {}