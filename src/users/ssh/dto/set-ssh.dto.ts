import{ IsNotEmpty } from 'class-validator';

export class SetSshKeyDto {
    @IsNotEmpty()
    publicKey: string;

    @IsNotEmpty()
    name: string;
}