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
import { GetUser } from 'src/auth/decorators/user.decorator';
import { UserDecoratorType } from 'src/auth/types/user-decorator.type';
import { PrismaService } from 'src/prisma.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetStatusDto } from './dto/get-status.dto';
import { DeployDto } from './dto/deploy.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService, private prisma: PrismaService) {}

  // GET /projects
  // This action returns all of the authenticated user's projects
  @Get()
  async findAll(@GetUser() user: UserDecoratorType) {
    return this.projectsService.findAll(user.sub);
  }

  // GET /projects/:uuid
  // This action returns a #${id} project;
  @Get(':uuid')
  async findOne(@Param('uuid') id: string, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    return this.projectsService.findOne(id, user.sub);
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
    return this.projectsService.create(user.sub, request.name);
  }

  // DELETE /projects/:uuid
  // This action deletes a #${id} project
  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('uuid') uuid: string, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    // Delete the project from the database
    return this.projectsService.delete(uuid, user.sub);
  }

  // POST /projects/:uuid/start
  // This starts a deployment for a project
  @Post(':uuid/deploy')
  @UseGuards(JwtAuthGuard)
  async deploy(@Param('uuid') uuid: string, @GetUser() user: UserDecoratorType, @Body() request: DeployDto): Promise<SanitizedProject> {
    return this.projectsService.deploy(uuid, user.sub, request.env_vars);
  }

  // POST /projects/:uuid/stop
  // This stops a deployment for a project
  @Post(':uuid/stop')
  @UseGuards(JwtAuthGuard)
  async stop(@Param('uuid') uuid: string, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    return this.projectsService.stopDeployment(uuid, user.sub);
  }

  // POST /projects/:uuid/logs
  // This gets logs for a deployment
  @Post(':uuid/logs')
  @UseGuards(JwtAuthGuard)
  async getLogs(@Param('uuid') uuid: string, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    return this.projectsService.getDeploymentLogs(uuid, user.sub);
  }

  // POST /projects/:uuid/statistics
  // This gets statistics for a deployment
  @Post(':uuid/statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Param('uuid') uuid: string, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    return await this.projectsService.getStatistics(uuid, user.sub);
  }

  // POST /projects/status
  // This gets status for one or more deployments
  @Post('/status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Body() request: GetStatusDto, @GetUser() user: UserDecoratorType): Promise<SanitizedProject> {
    return await this.projectsService.getStatus(request.container_names, user.sub);
  }
}
