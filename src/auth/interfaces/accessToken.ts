import { ApiProperty } from '@nestjs/swagger';

export interface UserLogin {
  accessToken: string;
  isAdmin: boolean;
}
export class AccessToken {
  @ApiProperty()
  accessToken: string;
}
