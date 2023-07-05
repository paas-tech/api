import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from '../users.service';
import { SshController } from './ssh.controller';
import { SshService } from './ssh.service';


@Module({
  controllers: [SshController],
  providers: [SshService, PrismaService, UsersService],
  exports: [SshService]
})
export class SshModule {}