import { SanitizedUser } from './types/sanitized-user.type';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Req, UnauthorizedException } from '@nestjs/common';
import { SetSshDto } from './dto/set-ssh.dto';
import { UsersService } from './users.service';
import { AdminOnly } from 'src/auth/decorators/adminonly.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /users/:username
  // This action returns a #${username} user
  @Get(':username')
  async findOne(@Param('username') username: string, @Req() req: Request): Promise<SanitizedUser> {
    if (req['user']?.username !== username) {
      throw new UnauthorizedException();
    }
    return await this.usersService.findOne({ username });
  }

  // DELETE /users/:username
  // This action deletes a #${username} user
  @AdminOnly()
  @Delete(':username')
  async delete(@Param('username') username: string): Promise<String> {
    try {
      await this.usersService.delete({ username });
    } catch (err) {
      throw new HttpException('User deletion failed', HttpStatus.BAD_REQUEST, { cause: err });
    }
    return 'User deleted successfully';
  }

  // PATCH /users/:username/ssh
  // This action adds a key ${setSshDto} to a user's keys
  @Patch(':username/ssh')
  async setSshKey(@Body() setSshDto: SetSshDto) {
    // TODO: implement correctly
    return this.usersService.setSshKey(setSshDto);
  }
}
