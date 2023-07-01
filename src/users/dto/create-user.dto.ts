import{ IsEmail, IsNotEmpty, Matches } from 'class-validator';
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
    @Matches(PASSWORD_REGEX, {
        message: 'Password should be minimum eight character long and have at least one uppercase letter, one lowercase letter, one number and one special character.'
    })
    password: string;
}