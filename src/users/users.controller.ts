import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { SetSshDto } from './dto/set-ssh.dto';
import { AccessToken } from './interfaces/accessToken';
import { User } from './interfaces/user';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
        private authService: AuthService
    ) {}

    // GET /users/:uuid
    // This action returns a #${id} user
    @Get(':uuid')
    async findOne(@Param('uuid') id: string): Promise<User> {
        return this.usersService.findOne(id);
    }

    // POST /users
    // This action adds a new user
    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
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

    // DELETE /users/:uuid
    // This action deletes a #${id} user
    @Delete(':uuid')
    delete(@Param('uuid') id: string) {
        this.usersService.delete(id);
        return `User #${id} deleted`;
    }

    // PATCH /users/:uuid/ssh
    // This action adds a key ${setSshDto} to a user's keys
    @Patch(':uuid/ssh')
    async setSshKey(@Body() setSshDto: SetSshDto) {
        return this.usersService.setSshKey(setSshDto);
    }
}
