import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { SetSshDto } from './dto/set-ssh.dto';
import { AccessToken } from './interfaces/accessToken';
import { UsersService } from './users.service';
import { SanitizedUser } from './types/sanitized-user.type';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
        private authService: AuthService
    ) {}

    // GET /users/:username
    // This action returns a #${id} user
    @Get(':username')
    async findOne(@Param('username') username: string): Promise<SanitizedUser> {
        return await this.usersService.findOne({username});
    }

    // POST /users
    // This action adds a new user
    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<SanitizedUser> {
        return await this.usersService.create(createUserDto);
    }

    // POST /users/login
    // This action returns an access token
    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto): Promise<AccessToken> {
        return this.authService.login(loginUserDto);
    }

    @Post('logout')
    async logout() {
        this.authService.logout();
        return "User is logged out";
    }

    // DELETE /users/:username
    // This action deletes a #${id} user
    @Delete(':username')
    delete(@Param('username') username: string): string {
        this.usersService.delete({username});
        return `OK`;
    }

    // PATCH /users/:username/ssh
    // This action adds a key ${setSshDto} to a user's keys
    @Patch(':username/ssh')
    async setSshKey(@Body() setSshDto: SetSshDto) {
        // TODO: implement correctly
        return this.usersService.setSshKey(setSshDto);
    }
}
