import { PartialType } from '@nestjs/mapped-types';
import { CreateJobMetaDto } from './create-job-meta.dto';

export class UpdateJobMetaDto extends PartialType(CreateJobMetaDto) {}