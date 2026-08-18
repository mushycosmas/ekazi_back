import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class UserPermissionDto {
  @IsInt()
  @IsNotEmpty()
  permission_id: number;

  @IsString()
  @IsIn(['allow', 'deny'])
  type: 'allow' | 'deny';
}

export class CreateClientStaffDto {
  @IsOptional()
  @IsInt()
  prefix_id?: number;

  @IsInt()
  @IsNotEmpty()
  client_staff_position_id: number;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsOptional()
  @IsString()
  middle_name?: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

//   @IsInt()
//   role_id: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionDto)
  user_permissions?: UserPermissionDto[];
}