import { PartialType } from '@nestjs/mapped-types';
import { CreateJobReportTosDto } from './create-job-report-tos.dto';

export class UpdateJobReportTosDto extends PartialType(CreateJobReportTosDto) {}