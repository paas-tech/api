import{ IsByteLength, IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { PASSWORD_REGEX } from 'src/utils/constants';
import { MatchesWithProperty } from 'src/validators/match-other.validator';

export class PasswordResetDto {
    @IsNotEmpty()
    @IsByteLength(0, 72)
    @MaxLength(72)
    @Matches(PASSWORD_REGEX, {
        message: 'Password should be minimum eight character long and have at least one uppercase letter, one lowercase letter, one number and one special character.'
    })
    password: string;

    @IsNotEmpty()
    @IsByteLength(0, 72)
    @MaxLength(72)
    @Matches(PASSWORD_REGEX, {
        message: 'Password should be minimum eight character long and have at least one uppercase letter, one lowercase letter, one number and one special character.'
    })
    @MatchesWithProperty<PasswordResetDto>(PasswordResetDto, o => o.password)
    passwordVerification: string;
}