import{ IsByteLength, IsNotEmpty, MaxLength } from 'class-validator';
import { MatchesWithProperty } from 'src/validators/match-other.validator';

export class PasswordResetDto {
    @IsNotEmpty()
    @IsByteLength(0, 72)
    @MaxLength(72)
    password: string;

    @IsNotEmpty()
    @MatchesWithProperty(PasswordResetDto, o => o.password)
    passwordVerification: string;
}