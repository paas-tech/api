import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from '../users/users.service';
import { SshKeyController } from './sshkeys.controller';
import { SshKeyService } from './sshkeys.service';


@Module({
  controllers: [SshKeyController],
  providers: [SshKeyService, PrismaService, UsersService],
  exports: [SshKeyService]
})
export class SshKeyModule {}