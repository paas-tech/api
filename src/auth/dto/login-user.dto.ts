import{ IsByteLength, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginUserDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MaxLength(72)
    @IsByteLength(0, 72)
    password: string;
}