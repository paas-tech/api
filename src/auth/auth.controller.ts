import { BadRequestException, Body, Controller, HttpCode, InternalServerErrorException, Param, ParseUUIDPipe, Post, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AccessToken } from './dto/responses/access-token.dto';
import { Public } from '../decorators/public.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SanitizedUser } from 'src/users/types/sanitized-user.type';
import { ApiBearerAuth, ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PasswordRequestDto } from './dto/password-request.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { Response as EResponse } from 'express';
import { ApiStandardResponse } from 'src/interfaces/standard-response.inteface';
import { CompliantContentResponse, MessageResponse, VoidResponse } from 'src/types/standard-response.type';

@ApiTags('auth')
@ApiResponse({ type: ApiStandardResponse })
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/login
  // This action returns an access token
  @Public()
  @Post('login')
  async login(@Response({ passthrough: true }) response: EResponse, @Body() loginUserDto: LoginUserDto): Promise<CompliantContentResponse<AccessToken>> {
    return this.authService.login(response, loginUserDto);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiCookieAuth()
  async logout(@Response({ passthrough: true }) response: EResponse): Promise<VoidResponse> {
    return await this.authService.logout(response);
  }

  // POST /auth/register
  // This action adds a new user
  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<CompliantContentResponse<SanitizedUser>> {
    return await this.authService.register(createUserDto);
  }

  // POST /auth/confirm/:token
  // This path lets the user confirm his email
  @Public()
  @Post('confirm/:token')
  async confirmEmail(@Param('token', new ParseUUIDPipe()) token: string): Promise<MessageResponse> {
    if (!(await this.authService.confirmEmail(token))) {
      throw new BadRequestException('No user with these specifications has been found.');
    }
    return 'Email successfully verified';
  }

  // POST /auth/password/request
  // This path lets the user request to change his password
  @Public()
  @Post('password/request')
  async requestPassword(@Body() passwordRequestDto: PasswordRequestDto): Promise<MessageResponse> {
    await this.authService.passwordRequest(passwordRequestDto);
    // This function will always return this message for security reasons
    return 'If there was an account with this email, they should receive an email with the instructions on how to change their password.';
  }

  // POST /auth/password/reset
  // This path lets the user reset his password
  @Public()
  @Post('password/reset/:token')
  async resetPassword(@Param('token', new ParseUUIDPipe()) token: string, @Body() passwordResetDto: PasswordResetDto): Promise<MessageResponse> {
    if (!(await this.authService.passwordReset(token, passwordResetDto))) {
      throw new InternalServerErrorException('We were not able to reset your password.');
    }
    return 'Your password has successfully been updated.';
  }
}
