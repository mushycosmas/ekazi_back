import { PartialType } from '@nestjs/mapped-types';
import { CreateTermConditionTypeDto } from './create-term-condition-type.dto';

export class UpdateTermConditionTypeDto extends PartialType(
    CreateTermConditionTypeDto,
) {}