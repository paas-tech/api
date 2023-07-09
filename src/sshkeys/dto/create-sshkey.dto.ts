import { IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateSshKeyDto {
    @IsNotEmpty()
    value: string;

    @IsOptional()
    @MaxLength(30)
    name: string;
}
