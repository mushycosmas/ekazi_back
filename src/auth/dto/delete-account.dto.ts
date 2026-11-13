import {
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class DeleteAccountDto {
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['DELETE'], {
        message: 'Please type DELETE to confirm account deletion.',
    })
    confirmation: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    feedback?: string;
}