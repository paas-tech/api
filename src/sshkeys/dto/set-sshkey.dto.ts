import{ IsNotEmpty, Length } from 'class-validator';

export class SetSshKeyDto {
    @IsNotEmpty()
    publicKey: string;

    @IsNotEmpty()
    @Length(1, 40)
    name: string;
}