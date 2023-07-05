import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { AdminOnly } from 'src/auth/decorators/adminonly.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { SanitizedProject } from './types/sanitized-project.type';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
    constructor(private projectsService: ProjectsService) {}

    // GET /projects
    // This action returns all of the authenticated user's projects
    @AdminOnly()
    @Get()
    @HttpCode(501)
    async findAll() {
        // TODO: implement and remove the 501 decorator above
        return '501 Not Implemented';
    }

    // GET /projects/:uuid
    // This action returns a #${id} project;
    @Get(':uuid')
    async findOne(@Param('uuid') id: string): Promise<SanitizedProject> {
        return this.projectsService.findOne(id);
    }

    // POST /projects
    /*
        This action creates a project
        and returns a NewProject Object
        with the project's id and name
    */
    @Post()
    @HttpCode(501)
    async create(@Body() createProjectDto: CreateProjectDto) {
        // TODO: implement and remove the 501 decorator
        return '501 Not Implemented';
    }

    // DELETE /projects/:uuid
    // This action deletes a #${id} project
    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        this.projectsService.delete(uuid);
        return `OK`;
    }
}
