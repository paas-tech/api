import{ IsNotEmpty } from 'class-validator';

export class SetSshDto {
    @IsNotEmpty()
    publicKey: string;
}