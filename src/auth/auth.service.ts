import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { AccessToken, UserLogin } from './interfaces/accessToken';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SanitizedUser } from 'src/users/types/sanitized-user.type';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async register(createUserDto: CreateUserDto): Promise<SanitizedUser> {
    if (!(await this.usersService.validateEmail(createUserDto.email))) {
      throw new HttpException('Registration error - this email is already used', HttpStatus.BAD_REQUEST);
    }

    if (!(await this.usersService.validateUsername(createUserDto.username))) {
      throw new HttpException('Registration error - this username is already used', HttpStatus.BAD_REQUEST);
    }

    return await this.usersService.create(createUserDto);
  }

  // Sign user in by email and password
  async login(credentials: LoginUserDto): Promise<UserLogin> {
    const user = await this.usersService.findOneUnsanitized({ email: credentials.email });
    const passwordHash = user.password;
    const isCorrectPassword = await bcrypt.compare(credentials.password, passwordHash);
    if (!isCorrectPassword || !passwordHash) {
      throw new UnauthorizedException();
    }

    // Add a username in the JWT token
    const payload = { username: user.username, isAdmin: user.isAdmin, id: user.id };

    return { accessToken: await this.jwtService.signAsync(payload), isAdmin: user.isAdmin };
  }
}
