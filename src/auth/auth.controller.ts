import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { AccessToken } from 'src/auth/interfaces/accessToken';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { SanitizedUser } from 'src/users/types/sanitized-user.type';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) {}

    // POST /auth/login
    // This action returns an access token
    @Public()
    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto): Promise<AccessToken> {
        return this.authService.signIn(loginUserDto);
    }

    // POST /auth/register
    // This action adds a new user
    @Public()
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto): Promise<SanitizedUser> {
        if (!await this.usersService.validateEmail(createUserDto.email)) {
            throw new HttpException("Registration error - email is invalid or already used", HttpStatus.BAD_REQUEST);
        }

        if (!await this.usersService.validateUsername(createUserDto.username)) {
            throw new HttpException("Registration error - username is invalid or already used", HttpStatus.BAD_REQUEST);
        }

        if (!await this.usersService.validatePassword(createUserDto.password)) {
            throw new HttpException("Registration error - password is invalid", HttpStatus.BAD_REQUEST);
        }

        return await this.usersService.create(createUserDto);
    }
}
