import { PartialType } from '@nestjs/mapped-types';
import { CreateInterviewActionDto } from './create-interview-action.dto';

export class UpdateInterviewActionDto extends PartialType(
    CreateInterviewActionDto,
) {}