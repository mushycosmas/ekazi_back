import {
    IsInt,
    IsOptional,
    IsString,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateClientStaffDto {

    @Type(() => Number)
    @IsInt()
    prefix_id: number;

    @Type(() => Number)
    @IsInt()
    client_id: number;

    @Type(() => Number)
    @IsOptional()
    @IsInt()
    user_id?: number;

    @IsString()
    first_name: string;

    @IsOptional()
    @IsString()
    middle_name?: string;

    @IsString()
    last_name: string;

    @IsString()
    phone_number: string;

}