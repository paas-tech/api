import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { AccessToken } from 'src/auth/interfaces/accessToken';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    // POST /auth
    // This action returns an access token
    @Public()
    @Post()
    async login(@Body() loginUserDto: LoginUserDto): Promise<AccessToken> {
        return this.authService.signIn(loginUserDto);
    }
}
