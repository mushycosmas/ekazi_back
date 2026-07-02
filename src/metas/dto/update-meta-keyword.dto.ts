import { PartialType } from '@nestjs/mapped-types';
import { CreateMetaKeywordDto } from './create-meta-keyword.dto';

export class UpdateMetaKeywordDto extends PartialType(
    CreateMetaKeywordDto,
) {}