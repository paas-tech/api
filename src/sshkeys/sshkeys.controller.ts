import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { SshKeysService } from './sshkeys.service';
import { AdminOnly } from 'src/auth/decorators/adminonly.decorator';
import { CreateSshKeyDto } from './dto/create-sshkey.dto';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { UserDecoratorType } from 'src/auth/types/user-decorator.type';

@Controller('sshkeys')
export class SshKeysController {
    constructor(
        private sshkeysService: SshKeysService
    ) {}

    // POST /sshkeys/my
    // This action adds a key ${setSshDto} to a user's keys
    @Post('my')
    async createSshKey(@Body() createSshDto: CreateSshKeyDto, @GetUser() user: UserDecoratorType) {
        try {
            if (!await this.sshkeysService.createSshKey(user.sub, createSshDto)) {
                return new HttpException("Unable to add this ssh key. Please verify the key and name.", HttpStatus.BAD_REQUEST);
            }
            return "SSH key was successfully created."
        } catch(err) {
            throw new HttpException("SSH key could not be added to this account.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DELETE /sshkeys/:username
    // This action removes a key ${setSshDto} to a user's keys
    @Delete('my/:uuid')
    async deleteSshKey(@Param('uuid') uuidSshKey: string, @GetUser() user: UserDecoratorType) {
        try {
            if(!await this.sshkeysService.removeSshKey(user.sub, uuidSshKey)) {
                throw new HttpException("User or key not found.", HttpStatus.BAD_REQUEST)
            }
        } catch(err) {
            throw new HttpException("SSH key could not be removed.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return "SSH key has successfully been removed."
    }


    // GET /sshkeys/my
    // This action gets all the ssh keys of the user
    @Get('my')
    async getSshKeys(@GetUser() user: UserDecoratorType) {
        try {
            return await this.sshkeysService.getSshKeysOfUser(user.sub);
        } catch(err) {
            throw new HttpException("SSH keys could not be retrieved.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // GET /sshkeys/
    // This action gets all ssh keys
    @AdminOnly()
    @Get()
    async getAllSshKeys() {
        try {
            return await this.sshkeysService.getAllSshKeys();
        } catch(err) {
            throw new HttpException("SSH keys could not be retrieved.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
