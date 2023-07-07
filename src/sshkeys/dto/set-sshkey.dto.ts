import{ IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class SetSshKeyDto {
    @IsNotEmpty()
    publicKey: string;

    @MaxLength(30)
    @IsOptional()
    name: string;
}