import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { SanitizedProject } from './types/sanitized-project.type';
import { RepositoryRequest } from 'paastech-proto/types/proto/git-repo-manager';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { GitRepoManagerService } from './git-repo-manager.service';
import { UserDecoratorType } from 'src/auth/types/user-decorator.type';
import { DeleteRepositoryDto } from './dto/delete-repository.dto';
import { PrismaService } from 'src/prisma.service';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService, private prisma: PrismaService) {}

  // GET /projects
  // This action returns all of the authenticated user's projects
  @Get()
  async findAll(@GetUser() user: UserDecoratorType) {
    return this.projectsService.findAll(user.id);
  }

  // GET /projects/:uuid
  // This action returns a #${id} project;
  @Get(':uuid')
  async findOne(@Param('uuid') id: string, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    return this.projectsService.findOne(id, user.id);
  }

  // POST /projects
  /*
        This action creates a project
        and returns a NewProject Object
        with the project's id and name
    */
  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() request: CreateProjectDto, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    const createdProject = await this.projectsService.create(user.id, request.name);
    // Send the gRPC request to create the repository

    return createdProject;
  }

  // DELETE /projects/:uuid
  // This action deletes a #${id} project
  @Delete(':uuid')
  @UseGuards(AuthGuard)
  async delete(@Param('uuid') uuid: string, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    // Delete the project from the database
    const project = await this.projectsService.delete(uuid, user.id);

    return project;
  }
}
