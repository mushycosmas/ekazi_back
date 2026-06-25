import { IsInt, IsString } from 'class-validator';

export class CreateJobOtherRequirementDto {
  @IsInt()
  job_id: number;

  @IsString()
  other_requirement: string;
}