import { PartialType } from '@nestjs/mapped-types';
import { CreateJobEducationDto } from './create-job-education.dto';

export class UpdateJobEducationDto extends PartialType(CreateJobEducationDto) {}