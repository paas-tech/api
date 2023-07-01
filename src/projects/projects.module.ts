import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from 'src/prisma.service';
import { GitRepoManagerService } from './git-repo-manager.service';
<<<<<<< HEAD

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService, GitRepoManagerService],
=======
import { PomegranateService } from './pomegranate.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService, PomegranateService, GitRepoManagerService],
>>>>>>> d1965db (feat(diablox9): modern warfare 2)
})
export class ProjectsModule {}
