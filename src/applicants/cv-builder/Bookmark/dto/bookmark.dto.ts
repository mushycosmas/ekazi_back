import { IsInt, IsNotEmpty } from 'class-validator';

export class BookmarkDto {
  @IsInt()
  @IsNotEmpty()
  applicant_id: number;

  @IsInt()
  @IsNotEmpty()
  template_id: number;
}