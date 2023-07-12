import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from '../users/users.service';
import { SshKeysController } from './sshkeys.controller';
import { SshKeysService } from './sshkeys.service';
import { CustomLoggerService } from 'src/logger/custom-logger.service';

@Module({
  controllers: [SshKeysController],
  providers: [SshKeysService, PrismaService, UsersService, CustomLoggerService],
  exports: [SshKeysService],
})
export class SshKeysModule {}
