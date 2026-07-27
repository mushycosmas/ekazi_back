import { PartialType } from '@nestjs/mapped-types';
import { CreateInterviewTypeDto } from './create-interview-type.dto';

export class UpdateInterviewTypeDto extends PartialType(
    CreateInterviewTypeDto,
) {}