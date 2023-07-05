import{ IsEmail, IsNotEmpty } from 'class-validator';

export class PasswordResetDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    passwordVerification: string;
}