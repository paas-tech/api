import { IsEmail, MaxLength } from 'class-validator';
import { IsAcceptablePassword } from 'src/decorators/dto/acceptable-password.decorator';
import { IsAcceptableUsername } from 'src/decorators/dto/acceptable-username.decorator';

export class CreateUserDto {
  @IsAcceptableUsername()
  username: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsAcceptablePassword()
  password: string;
}
