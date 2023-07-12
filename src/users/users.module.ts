import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';
import { CustomLoggerService } from 'src/logger/custom-logger.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, CustomLoggerService],
  exports: [UsersService],
})
export class UsersModule {}
