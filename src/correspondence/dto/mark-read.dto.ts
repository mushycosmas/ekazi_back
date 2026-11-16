import { IsInt } from 'class-validator';

export class MarkReadDto {
  @IsInt()
  message_id: number;
}