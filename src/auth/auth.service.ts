import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { AccessToken } from './dto/responses/access-token.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SanitizedUser } from 'src/users/types/sanitized-user.type';
import { MailService } from 'src/mail/mail.service';
import { PasswordRequestDto } from './dto/password-request.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { JwtEncodedUserData, RequestUser } from './types/jwt-user-data.type';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  public static ACCESS_COOKIE_NAME = "access"

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<SanitizedUser> {
    try {
      return this.usersService.sanitizeOutput(await this.usersService.create(createUserDto));
    }
    catch (err) {
      // Handle violation of unique keys email and username and return clear error message
      if (err.code === 'P2002' && err.meta?.target?.length > 0) {
        throw new BadRequestException(`Registration error - this ${err.meta.target[0]} is already used`);
      }
      throw new InternalServerErrorException("Something went wrong");
    }
  }

  // Sign user in by email and password
  async login(response: Response, credentials: LoginUserDto): Promise<AccessToken> {
    const user = await this.validateUser(credentials);
    if(!user) {
      throw new UnauthorizedException();
    }

    // Add a username in the JWT token
    const payload: JwtEncodedUserData = {
      sub: user['id'],
      username: user['username'],
      isAdmin: user['isAdmin']
    };

    const jwt = await this.jwtService.signAsync(payload);
    this.setCookie(response, jwt);

    return {accessToken: jwt};
  }

  async logout(response: Response) {
    this.setCookie(response);
  }

  async validateUser(credentials: LoginUserDto): Promise<RequestUser|null> {
    const user = await this.usersService.findOneUnsanitized({email: credentials.email});
    if (user && !user.emailNonce && await bcrypt.compare(credentials.password, user.password)) {
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
    if (!sanitizedUser) {
      return false;
    }
    return this.usersService.validateEmailNonce(token);
  }


  // request password reset
  async passwordRequest(passwordRequestDto: PasswordRequestDto): Promise<void> {
    try {
      let user = await this.usersService.findOneUnsanitized({email: passwordRequestDto.email})
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
  async passwordReset(token: string, passwordResetDto: PasswordResetDto) : Promise<boolean> {
    let user = await this.usersService.findOneUnsanitized({passwordNonce: token})
    if (!user) {
      return false;
    } 
    if (!await this.usersService.updatePassword(user.id, passwordResetDto.password)) {
      return false;
    }
    return true;
  }

  /**
   * Sets cookie to a given value, or invalidates it if no value is given
   * @param response the Express Response
   * @param value if not null, the JWT that should be put in the cookie
   */
  setCookie(response: Response, value: string = null) {
    // defaults for cookie "invalidation"
    let val = "";
    let time = 30 * 1000; // expire very soon, the cookie is empty anyways so no need to keep it

    if (value !== null) {
      val = value;
      time = 6 * 60 * 60 * 1000; // 6 hours
    }

    response.cookie(AuthService.ACCESS_COOKIE_NAME, val, {
      httpOnly: true,
      sameSite: true,
      secure: !(this.configService.getOrThrow('APP_DEV_MODE') === 'true'),
      maxAge: time
    })
  }

}
