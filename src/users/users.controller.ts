import { SanitizedUser } from './types/sanitized-user.type';
import { Body, Controller, Delete, Get, Post, Param, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { SetSshDto } from './dto/set-ssh.dto';
import { UsersService } from './users.service';
import { AdminOnly } from 'src/auth/decorators/adminonly.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { ResponseError, ResponseSuccess } from 'src/utils/response.dto';
import { IResponse } from 'src/utils/response.interface';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}

    // GET /users/:username
    // This action returns a #${username} user
    @Get(':username')
    async findOne(@Param('username') username: string, @Req() req: Request): Promise<SanitizedUser> {
        if (req['user']?.username !== username) {
            throw new UnauthorizedException();
        }
        return await this.usersService.findOne({username});
    }

    // POST /users
    // This action adds a new user
    @Public()
    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<IResponse> {
        if (!await this.usersService.validateEmail(createUserDto.email)) {
            return new ResponseError("Registration error - email is invalid or already used");
        }

        if (!await this.usersService.validateUsername(createUserDto.username)) {
            return new ResponseError("Registration error - username is invalid or already used");
        }

        if (!await this.usersService.validatePassword(createUserDto.password)) {
            return new ResponseError("Registration error - password is invalid");
        }

        return new ResponseSuccess(
            "User registered successfully",
            await this.usersService.create(createUserDto)
        );
    }

    // DELETE /users/:username
    // This action deletes a #${username} user
    @AdminOnly()
    @Delete(':username')
    async delete(@Param('username') username: string): Promise<IResponse> {
        try {
            await this.usersService.delete({username});
        }
        catch(err) {
            return new ResponseError("User deletion failed", err);
        }
        return new ResponseSuccess("User ${username} deleted successfully");

    }

    // PATCH /users/:username/ssh
    // This action adds a key ${setSshDto} to a user's keys
    @Patch(':username/ssh')
    async setSshKey(@Body() setSshDto: SetSshDto) {
        // TODO: implement correctly
        return this.usersService.setSshKey(setSshDto);
    }
}
