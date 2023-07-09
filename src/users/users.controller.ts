import { SanitizedUser } from './types/sanitized-user.type';
import { BadRequestException, Controller, Delete, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminOnly } from 'src/auth/decorators/adminonly.decorator';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { RequestUser } from 'src/auth/types/jwt-user-data.type';

@ApiBearerAuth()
@ApiCookieAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
    ) {}

    // GET /users
    // This action returns all users
    @AdminOnly()
    @Get()
    async findAll(): Promise<SanitizedUser[]> {
        return await this.usersService.findAll();
    }

    // GET /users/my
    // This action returns a user's profile
    @Get('my')
    async getProfile(@GetUser() user: RequestUser): Promise<SanitizedUser> {
        return await this.usersService.findOne({ id: user.id });
    }

    // GET /users/:username
    // This action returns a #${username} user
    @AdminOnly()
    @Get(':username')
    async findOne(@Param('username') username: string): Promise<SanitizedUser> {
        return await this.usersService.findOne({ username });
    }

    // DELETE /users/:username
    // This action deletes a #${username} user
    @AdminOnly()
    @Delete(':username')
    async delete(@Param('username') username: string): Promise<String> {
        try {
            await this.usersService.delete({ username });
        }
        catch (err) {
            throw new BadRequestException('User deletion failed');
        }
        return "User deleted successfully";

    }


}
