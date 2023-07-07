import{ IsNotEmpty, Length } from 'class-validator';

export class CreateSshKeyDto {
    @IsNotEmpty()
    value: string;

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    @Length(1, 40)
    name: string;
}