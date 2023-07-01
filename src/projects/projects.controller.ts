import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdminOnly } from 'src/auth/decorators/adminonly.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { SanitizedProject } from './types/sanitized-project.type';
import { RepositoryRequest, RepositoryResponse } from 'paastech-proto/types/proto/git-repo-manager';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { GitRepoManagerService } from './git-repo-manager.service';
import { UserDecoratorType } from 'src/auth/types/user-decorator.type';
import { DeleteRepositoryDto } from './dto/delete-repository.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService, private gitRepoManagerService: GitRepoManagerService) {}

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
  async createRepository(@Body() request: CreateProjectDto, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    // Check if project name is not already used for this user
    const project = await this.projectsService.findOneByName(request.name, user.id);
    if (project) {
      throw new BadRequestException('Project already exists');
    }

    const createdProject = await this.projectsService.create(user.id, request);
    // Create the project's repository
    const projectPath = `${createdProject.uuid}`;
    const repositoryRequest: RepositoryRequest = this.createRepositoryRequest(projectPath);

    // Send the gRPC request to create the repository
    await this.gitRepoManagerService.create(repositoryRequest);

    return createdProject;
  }

  // DELETE /projects/:uuid
  // This action deletes a #${id} project
  @Delete(':uuid')
  @UseGuards(AuthGuard)
  async delete(@Query() request: DeleteRepositoryDto, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    // Delete the project from the database
    const project = await this.projectsService.delete(request.uuid);

    // Send the grpc request to delete the repository
    const repositoryRequest: RepositoryRequest = this.createRepositoryRequest(request.uuid);
    this.gitRepoManagerService.delete(repositoryRequest);

    return project;
  }

  // Helper to create a RepositoryRequest object
  createRepositoryRequest(path: string): RepositoryRequest {
    return {
      repository_path: path,
    };
  }
}
