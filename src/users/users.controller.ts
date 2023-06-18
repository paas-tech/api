import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { SetSshDto } from './dto/set-ssh.dto';

@Controller('users')
export class UsersController {
    // GET /users/:uuid
    @Get(':uuid')
    findOne(@Param('uuid') id: string) {
        return `This action returns a #${id} user`;
    }

    // POST /users
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return `This action adds a new user`;
    }

    // POST /users/login
    @Post('login')
    login(@Body() loginUserDto: LoginUserDto) {
        return `This action returns an access token`;
    }

    // DELETE /users/:uuid
    @Delete(':uuid')
    delete(@Param('uuid') id: string) {
        return `This ation deletes a #${id} user`;
    }

    // PATCH /users/:uuid/ssh
    @Patch(':uuid/ssh')
    setSshKey(@Body() setSshDto: SetSshDto) {
        return `This action adds a key ${setSshDto} to a user's keys`;
    }
}
