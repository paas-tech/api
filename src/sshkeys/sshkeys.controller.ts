import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { SshKeysService } from './sshkeys.service';
import { AdminOnly } from 'src/auth/decorators/adminonly.decorator';
import { CreateSshKeyDto } from './dto/create-sshkey.dto';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { RequestUser } from 'src/auth/types/jwt-user-data.type';
import { ApiBearerAuth, ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse } from 'src/interfaces/standard-response.inteface';

@ApiBearerAuth()
@ApiCookieAuth()
@ApiTags('ssh keys')
@ApiResponse({type: ApiStandardResponse})
@Controller('sshkeys')
export class SshKeysController {
    constructor(
        private sshkeysService: SshKeysService
    ) {}

    // POST /sshkeys/my
    // This action adds a key ${setSshDto} to a user's keys
    @Post('my')
    async createSshKey(@Body() createSshDto: CreateSshKeyDto, @GetUser() user: RequestUser) {
        if (!await this.sshkeysService.createSshKey(user.id, createSshDto)) {
            return new HttpException("Unable to add this ssh key. Please verify the key and name.", HttpStatus.BAD_REQUEST);
        }
        return {
            status: "created",
            message: "SSH key has successfully been created."
        }
    }

    // DELETE /sshkeys/:username
    // This action removes a key ${setSshDto} to a user's keys
    @Delete('my/:uuid')
    async deleteSshKey(@Param('uuid', new ParseUUIDPipe()) uuidSshKey: string, @GetUser() user: RequestUser) {
        if(!await this.sshkeysService.removeSshKey(user.id, uuidSshKey)) {
            throw new HttpException("No ssh key with these specifications could be found.", HttpStatus.BAD_REQUEST)
        }
        return {
            status: "removed",
            message: "SSH key has successfully been deleted."
        }
    }


    // GET /sshkeys/my
    // This action gets all the ssh keys of the user
    @Get('my')
    async getSshKeys(@GetUser() user: RequestUser) {
        return {
            status: "OK",
            content: await this.sshkeysService.getSshKeysOfUser(user.id)
        }
    }


    // GET /sshkeys/
    // This action gets all ssh keys
    @AdminOnly()
    @Get()
    async getAllSshKeys() {
        return {
            status: "OK",
            content: await this.sshkeysService.getAllSshKeys()
        }
    }
}
