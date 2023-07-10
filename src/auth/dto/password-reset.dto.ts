import { IsAcceptablePassword } from 'src/decorators/dto/acceptable-password.decorator';
import { MatchesWithProperty } from 'src/validators/match-other.validator';

export class PasswordResetDto {
  @IsAcceptablePassword()
  password: string;

  @IsAcceptablePassword()
  @MatchesWithProperty<PasswordResetDto>(PasswordResetDto, (o) => o.password)
  passwordVerification: string;
}
