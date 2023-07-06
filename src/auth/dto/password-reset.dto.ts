import{ IsNotEmpty } from 'class-validator';
import { MatchesWithProperty } from 'src/validators/match-other.validator';

export class PasswordResetDto {
    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    @MatchesWithProperty(PasswordResetDto, o => o.password)
    passwordVerification: string;
}