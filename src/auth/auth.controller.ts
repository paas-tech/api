import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { AccessToken } from '../auth/interfaces/accessToken';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SanitizedUser } from 'src/users/types/sanitized-user.type';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    // POST /auth/login
    // This action returns an access token
    @Public()
    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto): Promise<AccessToken> {
        return this.authService.login(loginUserDto);
    }

    // POST /auth/register
    // This action adds a new user
    @Public()
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto): Promise<SanitizedUser> {
        return await this.authService.register(createUserDto);
    }

    // GET /auth/pwreset/:token
    // This path lets the user confirm his email
    @Public()
    @Get('/confirm')
    async confirmEmail(@Query('token') token: string): Promise<string> {
        if (!await this.authService.confirmEmail(token)) {
            throw new HttpException("No user with these specifications has been found.", HttpStatus.BAD_REQUEST)
        }
        return "Email successfully verified";

    }
}