import{ IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProjectDto {
    @IsNotEmpty()
    @MaxLength(30)
    name: string;
}