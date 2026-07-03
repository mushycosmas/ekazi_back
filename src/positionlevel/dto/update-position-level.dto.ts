import { PartialType } from '@nestjs/mapped-types';
import { CreatePositionLevelDto } from './create-position-level.dto';

export class UpdatePositionLevelDto extends PartialType(CreatePositionLevelDto) {}