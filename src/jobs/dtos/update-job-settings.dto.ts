import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateJobSettingsDto {

    @IsOptional()
    @IsBoolean()
    show_client_name?: boolean;


    @IsOptional()
    @IsBoolean()
    apply_condition?: boolean;


    @IsOptional()
    @IsString()
    apply_type?: 'email' | 'external_url';


    @IsOptional()
    @IsString()
    email?: string;


    @IsOptional()
    @IsString()
    external_url?: string;

}