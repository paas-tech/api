import{ IsByteLength, IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { PASSWORD_REGEX, USERNAME_REGEX } from 'src/utils/constants';

export class CreateUserDto {
    @IsNotEmpty()
    @Matches(USERNAME_REGEX, {
        message: 'Username should be 3 to 30 character long, it starts with a letter and only has letters, digits and underscores.'
    })
    username: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    // The documentation for the bcrypt package states that : "Per bcrypt implementation, only the first 72 bytes of a string are used."
    // So we need to check for maximal length & bytelength of the password
    @MaxLength(72)
    @IsByteLength(0, 72)
    @Matches(PASSWORD_REGEX, {
        message: 'Password should be minimum eight character long and have at least one uppercase letter, one lowercase letter, one number and one special character.'
    })
    password: string;
}