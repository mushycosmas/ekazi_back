import { PartialType } from '@nestjs/mapped-types';
import { CreateLanguageUnderstandDto } from './create-language-understand.dto';


export class UpdateLanguageUnderstandDto 
extends PartialType(CreateLanguageUnderstandDto) {}