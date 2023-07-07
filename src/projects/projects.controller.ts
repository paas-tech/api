import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { SanitizedProject } from './types/sanitized-project.type';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { RequestUser } from 'src/auth/types/jwt-user-data.type';
import { PrismaService } from 'src/prisma.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(
    private projectsService: ProjectsService,
    private prisma: PrismaService,
  ) {}

  // GET /projects
  // This action returns all of the authenticated user's projects
  @Get()
  async findAll(@GetUser() user: RequestUser) {
    return this.projectsService.findAll(user.id);
  }

  // GET /projects/:uuid
  // This action returns a #${id} project;
  @Get(':uuid')
  async findOne(
    @Param('uuid') id: string,
    @GetUser() user: RequestUser,
  ): Promise<SanitizedProject> {
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
  async create(
    @Body() request: CreateProjectDto,
    @GetUser() user: RequestUser,
  ): Promise<SanitizedProject> {
    const createdProject = await this.projectsService.create(
      user.id,
      request.name,
    );
    return createdProject;
  }

  // DELETE /projects/:uuid
  // This action deletes a #${id} project
  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('uuid') uuid: string,
    @GetUser() user: RequestUser,
  ): Promise<SanitizedProject> {
    // Delete the project from the database
    const project = await this.projectsService.delete(uuid, user.id);

    return project;
  }
}
