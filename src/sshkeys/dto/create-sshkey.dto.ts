import{ IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateSshKeyDto {
    @IsNotEmpty()
    value: string;

    @IsNotEmpty()
    userId: string;

    @MaxLength(30)
    @IsOptional()
    name?: string;
}