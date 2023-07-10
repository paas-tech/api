import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { SanitizedProject } from './types/sanitized-project.type';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { RequestUser } from 'src/auth/types/jwt-user-data.type';
import { PrismaService } from 'src/prisma.service';
import { GetStatusDto } from './dto/get-status.dto';
import { DeployDto } from './dto/deploy.dto';
import { ApiBearerAuth, ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse } from 'src/interfaces/standard-response.inteface';

@ApiCookieAuth()
@ApiBearerAuth()
@ApiTags('projects')
@ApiResponse({ type: ApiStandardResponse })
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService, private prisma: PrismaService) {}

  // GET /projects
  // This action returns all of the authenticated user's projects
  @Get()
  async findAll(@GetUser() user: RequestUser) {
    return this.projectsService.findAll(user.id);
  }

  // GET /projects/:uuid
  // This action returns a #${id} project;
  @Get(':uuid')
  async findOne(@Param('uuid', new ParseUUIDPipe()) id: string, @GetUser() user: RequestUser): Promise<SanitizedProject> {
    return this.projectsService.findOne(id, user.id);
  }

  // POST /projects
  /*
        This action creates a project
        and returns a NewProject Object
        with the project's id and name
    */
  @Post()
  async create(@Body() request: CreateProjectDto, @GetUser() user: RequestUser): Promise<SanitizedProject> {
    return await this.projectsService.create(user.id, request.name);
  }

  // DELETE /projects/:uuid
  // This action deletes a #${id} project
  @Delete(':uuid')
  async delete(@Param('uuid', new ParseUUIDPipe()) uuid: string, @GetUser() user: RequestUser): Promise<SanitizedProject> {
    return await this.projectsService.delete(uuid, user.id);
  }

  // Patch /projects/:uuid/start
  // This starts a deployment for a project
  @Patch(':uuid/deploy')
  async deploy(@Param('uuid') uuid: string, @GetUser() user: RequestUser, @Body() request: DeployDto): Promise<SanitizedProject> {
    return this.projectsService.deploy(uuid, user.id, request.env_vars);
  }

  // POST /projects/:uuid/stop
  // This stops a deployment for a project
  @Post(':uuid/stop')
  async stop(@Param('uuid') uuid: string, @GetUser() user: RequestUser): Promise<SanitizedProject> {
    return this.projectsService.stopDeployment(uuid, user.id);
  }

  // GET /projects/:uuid/logs
  // This gets logs for a deployment
  @Get(':uuid/logs')
  async getLogs(@Param('uuid') uuid: string, @GetUser() user: RequestUser): Promise<SanitizedProject> {
    return this.projectsService.getDeploymentLogs(uuid, user.id);
  }

  // GET /projects/:uuid/statistics
  // This gets statistics for a deployment
  @Get(':uuid/statistics')
  async getStatistics(@Param('uuid') uuid: string, @GetUser() user: RequestUser): Promise<SanitizedProject> {
    return await this.projectsService.getStatistics(uuid, user.id);
  }

  // POST /projects/status
  // This gets status for one or more deployments
  @Post('/status')
  async getStatus(@Body() request: GetStatusDto, @GetUser() user: RequestUser): Promise<SanitizedProject> {
    return await this.projectsService.getStatus(request.container_names, user.id);
  }
}
