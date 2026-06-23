import { PartialType } from '@nestjs/mapped-types';
import { CreateJobLanguagesDto } from './create-job-languages.dto';

export class UpdateJobLanguagesDto extends PartialType(CreateJobLanguagesDto) {}