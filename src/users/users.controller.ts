import { SanitizedUser } from './types/sanitized-user.type';
import { Controller, Delete, Get, HttpException, HttpStatus, Param, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminOnly } from 'src/auth/decorators/adminonly.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
    ) {}

    // GET /users/:username
    // This action returns a #${username} user
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
            throw new HttpException('User deletion failed', HttpStatus.BAD_REQUEST, { cause: err });
        }
        return "User deleted successfully";

    }


}
