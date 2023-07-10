import { IsByteLength, IsEmail, IsNotEmpty, Length, Matches, MaxLength } from 'class-validator';
import { PASSWORD_REGEX, USERNAME_REGEX } from 'src/utils/constants';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(3, 30)
  @Matches(USERNAME_REGEX, {
    message: 'Should start with a letter and end with a letter or a figure. Can contain alphanumerical characters, hyphens and underscores.',
  })
  username: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsNotEmpty()
  // The documentation for the bcrypt package states that : "Per bcrypt implementation, only the first 72 bytes of a string are used."
  // So we need to check for maximal length & bytelength of the password
  @Length(8, 72)
  @IsByteLength(0, 72)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password should be minimum eight character long and have at least one uppercase letter, one lowercase letter, one number and one special character.',
  })
  password: string;
}
