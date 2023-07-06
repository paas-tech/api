import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { AccessToken } from './interfaces/accessToken';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SanitizedUser } from 'src/users/types/sanitized-user.type';
import { MailService } from 'src/mail/mail.service';
import { PasswordRequestDto } from './dto/password-request.dto';
import { PasswordResetDto } from './dto/password-reset.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService, private mailService: MailService) {}

  async register(createUserDto: CreateUserDto): Promise<SanitizedUser> {
    if (!(await this.usersService.validateEmail(createUserDto.email))) {
      throw new HttpException('Registration error - this email is already used', HttpStatus.BAD_REQUEST);
    }

    if (!(await this.usersService.validateUsername(createUserDto.username))) {
      throw new HttpException('Registration error - this username is already used', HttpStatus.BAD_REQUEST);
    }

    let user = await this.usersService.create(createUserDto);

    if (!(await this.mailService.sendUserConfirmation(user.email, user.emailNonce))) {
      throw new HttpException('Email could not be sent', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.usersService.sanitizeOutput(user);
  }

  // Sign user in by email and password
  async login(credentials: LoginUserDto): Promise<AccessToken> {
    const user = await this.validateUser(credentials);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Add a username in the JWT token
    const payload = {
      sub: user['id'],
      username: user['username'],
      isAdmin: user['isAdmin'],
    };

    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  async validateUser(credentials: LoginUserDto): Promise<SanitizedUser> {
    const user = await this.usersService.findOneUnsanitized({ email: credentials.email });
    if (user && !user.emailNonce && (await bcrypt.compare(credentials.password, user.password))) {
      return {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      };
    }
    console.log(user);
    return null;
  }

  // verify email token
  async confirmEmail(token: string): Promise<Boolean> {
    let sanitizedUser = await this.usersService.findOne({ emailNonce: token });
    if (!sanitizedUser) {
      return false;
    }
    return this.usersService.validateEmailNonce(token);
  }

  // request password reset
  async passwordRequest(passwordRequestDto: PasswordRequestDto): Promise<void> {
    try {
      let user = await this.usersService.findOneUnsanitized({ email: passwordRequestDto.email });
      if (user) {
        let passwordNonce = await this.usersService.regeneratePasswordNonce(user.id);
        if (!passwordNonce) {
          return;
        }
        await this.mailService.sendPasswordReset(passwordRequestDto.email, passwordNonce);
      }
    } catch (err) {
      return;
    }
  }

  // reset password
  async passwordReset(token: string, passwordResetDto: PasswordResetDto): Promise<boolean> {
    let user = await this.usersService.findOneUnsanitized({ passwordNonce: token });
    if (!user) {
      return false;
    }
    if (!(await this.usersService.updatePassword(user.id, passwordResetDto.password))) {
      return false;
    }
    return true;
  }
}
