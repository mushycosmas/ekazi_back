import { IsEnum, IsInt } from 'class-validator';

export enum ParticipantRole {
  ADMIN = 'admin',
  EMPLOYER = 'employer',
  APPLICANT = 'applicant',
  SYSTEM = 'system',
}

export class AddParticipantDto {
  @IsInt()
  user_id: number;

  @IsEnum(ParticipantRole)
  participant_type: ParticipantRole;
}