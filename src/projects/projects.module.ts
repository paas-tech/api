import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from 'src/prisma.service';
import { GitRepoManagerService } from './git-repo-manager.service';
import { PomegranateService } from './pomegranate.service';
import { CustomLoggerService } from 'src/logger/custom-logger.service';
@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService, GitRepoManagerService, PomegranateService, CustomLoggerService],
})
export class ProjectsModule {}
