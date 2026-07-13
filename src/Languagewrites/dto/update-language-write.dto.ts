import {
  PartialType,
} from '@nestjs/mapped-types';

import { CreateLanguageWriteDto } from './create-language-write.dto';


export class UpdateLanguageWriteDto extends PartialType(
  CreateLanguageWriteDto,
) {

}