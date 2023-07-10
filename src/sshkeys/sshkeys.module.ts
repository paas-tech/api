import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from '../users/users.service';
import { SshKeysController } from './sshkeys.controller';
import { SshKeysService } from './sshkeys.service';

@Module({
  controllers: [SshKeysController],
  providers: [SshKeysService, PrismaService, UsersService],
  exports: [SshKeysService],
})
export class SshKeysModule {}
