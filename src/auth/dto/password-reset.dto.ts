import{ IsEmail, IsNotEmpty } from 'class-validator';

export class PasswordResetDto {
    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    passwordVerification: string;
}