import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class DeactivateAccountDto {
    @IsString()
    @IsNotEmpty()
    password: string;
}