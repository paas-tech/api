import { IsNotEmpty } from 'class-validator';

export class GetStatusDto {
  @IsNotEmpty()
  container_names: string[];
}
