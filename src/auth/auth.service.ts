import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { AccessToken } from './interfaces/accessToken';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SanitizedUser } from 'src/users/types/sanitized-user.type';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<SanitizedUser> {
    if (!await this.usersService.validateEmail(createUserDto.email)) {
      throw new HttpException("Registration error - this email is already used", HttpStatus.BAD_REQUEST);
    }

    if (!await this.usersService.validateUsername(createUserDto.username)) {
      throw new HttpException("Registration error - this username is already used", HttpStatus.BAD_REQUEST);
    }

    // create email_nounce
    let uuid = uuidv4();

    if (!await this.mailService.sendUserConfirmation(createUserDto.email, uuid)) {
      throw new HttpException("Email could not be sent", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return await this.usersService.create(createUserDto, uuid);
  }

  // Sign user in by email and password
  async login(credentials: LoginUserDto): Promise<AccessToken> {
    const user = await this.validateUser(credentials);
    if(!user) {
      throw new UnauthorizedException();
    }

    const unsanitizedUser = await this.usersService.findOneUnsanitized({ email: credentials.email });
    if (unsanitizedUser.emailNonce !== null) {
      throw new HttpException('Email address not confirmed', HttpStatus.UNAUTHORIZED);
    }

    // Add a username in the JWT token
    const payload = {
      sub: user['id'],
      username: user['username'],
      isAdmin: user['isAdmin']
    };

    return {accessToken: await this.jwtService.signAsync(payload)};
  }

  async validateUser(credentials: LoginUserDto): Promise<SanitizedUser> {
    const user = await this.usersService.findOneUnsanitized({email: credentials.email});
    if (user && await bcrypt.compare(credentials.password, user.password)) {
      return {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      };
    }
    return null;
  }
  
  // verify email token
  async confirmEmail(token: string): Promise<Boolean> {
    let sanitizedUser = await this.usersService.findOne({emailNonce: token});
    if (sanitizedUser == null) {
      return false;
    }
    return this.usersService.validateEmailNonce(token);
  }
}
