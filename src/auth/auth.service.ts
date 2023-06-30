import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { AccessToken } from './interfaces/accessToken';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}



  // Sign user in by email and password
  async signIn(credentials: LoginUserDto): Promise<AccessToken> {
    const user = await this.prisma.user.findUnique({
      where: {email: credentials.email}
    });
    await this.usersService.findOne({email: credentials.email});
    const passwordHash = user['password'];
    const isCorrectPassword = await bcrypt.compare(credentials.password, passwordHash);
    if(!isCorrectPassword || !passwordHash) {
      throw new UnauthorizedException();
    }

    // Add a username in the JWT token
    const payload = {username: user['username'], isAdmin: user['isAdmin']};

    return {accessToken: await this.jwtService.signAsync(payload)};
  }
}
