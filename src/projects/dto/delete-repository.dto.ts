import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UUID } from 'crypto';

export class DeleteRepositoryDto {
  @IsNotEmpty()
  uuid: UUID;
}
