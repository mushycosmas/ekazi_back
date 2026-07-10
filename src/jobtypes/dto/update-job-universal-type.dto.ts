import { PartialType } from '@nestjs/mapped-types';
import { CreateJobUniversalTypeDto } from './create-job-universal-type.dto';

export class UpdateJobUniversalTypeDto extends PartialType(
    CreateJobUniversalTypeDto,
) {}