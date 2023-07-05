import{ IsNotEmpty } from 'class-validator';

export class CreateSshKeyDto {
    @IsNotEmpty()
    value: string;

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    name: string;
}