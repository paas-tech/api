import { Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { AccessToken } from './interfaces/accessToken';

@Injectable()
export class AuthService {

  login(credentials: LoginUserDto): AccessToken {
    return {accessToken: "Login Token"};
  }

  logout() {
    // Log the authenticated user out
  }
}