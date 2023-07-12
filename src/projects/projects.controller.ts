import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { SanitizedProject } from './types/sanitized-project.type';
import { GetUser } from 'src/decorators/user.decorator';
import { RequestUser } from 'src/auth/types/jwt-user-data.type';
import { GetStatusDto } from './dto/get-status.dto';
import { DeployDto } from './dto/deploy.dto';
import { ApiBearerAuth, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse } from 'src/interfaces/standard-response.inteface';
import { CompliantContentResponse } from 'src/types/standard-response.type';

@ApiCookieAuth()
@ApiBearerAuth()
@ApiTags('projects')
@ApiResponse({ type: ApiStandardResponse })
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  // GET /projects
  // This action returns all of the authenticated user's projects
  @ApiOkResponse({ type: ApiStandardResponse })
  @Get()
  async findAll(@GetUser() user: RequestUser): Promise<CompliantContentResponse<SanitizedProject[]>> {
    return this.projectsService.findAll(user.id);
  }

  // GET /projects/:uuid
  // This action returns a #${id} project;
  @ApiOkResponse({ type: ApiStandardResponse })
  @Get(':uuid')
  async findOne(@Param('uuid', new ParseUUIDPipe()) id: string, @GetUser() user: RequestUser): Promise<CompliantContentResponse<SanitizedProject>> {
    return this.projectsService.findOne(id, user.id);
  }

  // POST /projects
  /*
        This action creates a project
        and returns a NewProject Object
        with the project's id and name
    */
  @ApiCreatedResponse({ type: ApiStandardResponse })
  @Post()
  async create(@Body() request: CreateProjectDto, @GetUser() user: RequestUser): Promise<CompliantContentResponse<SanitizedProject>> {
    return await this.projectsService.create(user.id, request.name);
  }

  // DELETE /projects/:uuid
  // This action deletes a #${id} project
  @ApiOkResponse({ type: ApiStandardResponse })
  @Delete(':uuid')
  async delete(@Param('uuid', new ParseUUIDPipe()) uuid: string, @GetUser() user: RequestUser): Promise<CompliantContentResponse<SanitizedProject>> {
    return await this.projectsService.delete(uuid, user.id);
  }

  // Patch /projects/:uuid/start
  // This starts a deployment for a project
  @ApiOkResponse({ type: ApiStandardResponse })
  @Patch(':uuid/deploy')
  async deploy(@Param('uuid') uuid: string, @GetUser() user: RequestUser, @Body() request: DeployDto): Promise<CompliantContentResponse<SanitizedProject>> {
    return this.projectsService.deploy(uuid, user.id, request.env_vars);
  }

  // POST /projects/:uuid/stop
  // This stops a deployment for a project
  @ApiCreatedResponse({ type: ApiStandardResponse })
  @Post(':uuid/stop')
  async stop(@Param('uuid') uuid: string, @GetUser() user: RequestUser): Promise<CompliantContentResponse<SanitizedProject>> {
    return this.projectsService.stopDeployment(uuid, user.id);
  }

  // GET /projects/:uuid/logs
  // This gets logs for a deployment
  @ApiOkResponse({ type: ApiStandardResponse })
  @Get(':uuid/logs')
  async getLogs(@Param('uuid') uuid: string, @GetUser() user: RequestUser): Promise<CompliantContentResponse<SanitizedProject>> {
    return this.projectsService.getDeploymentLogs(uuid, user.id);
  }

  // GET /projects/:uuid/statistics
  // This gets statistics for a deployment
  @ApiOkResponse({ type: ApiStandardResponse })
  @Get(':uuid/statistics')
  async getStatistics(@Param('uuid') uuid: string, @GetUser() user: RequestUser): Promise<CompliantContentResponse<SanitizedProject>> {
    return await this.projectsService.getStatistics(uuid, user.id);
  }

  // POST /projects/status
  // This gets status for one or more deployments
  @ApiCreatedResponse({ type: ApiStandardResponse })
  @Post('/status')
  async getStatus(@Body() request: GetStatusDto, @GetUser() user: RequestUser): Promise<CompliantContentResponse<SanitizedProject>> {
    return await this.projectsService.getStatus(request.container_names, user.id);
  }
}
