import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { NewProject } from './interfaces/new-project';
import { Project } from './interfaces/project';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
    constructor(private projectsService: ProjectsService) {}
    // GET /projects
    // This action returns all of the authenticated user's projects
    @Get()
    async findAll(): Promise<Project[]> {
        return this.projectsService.findAll();
    }

    // GET /projects/:uuid
    // This action returns a #${id} project;
    @Get(':uuid')
    async findOne(@Param('uuid') id: string): Promise<Project> {
        return this.projectsService.findOne(id);
    }

    // POST /projects
    /*
        This action creates a project
        and returns a NewProject Object
        with the project's id and name
    */
    @Post()
    async create(@Body() createProjectDto: CreateProjectDto): Promise<NewProject> {
        return this.projectsService.create(createProjectDto);
    }

    // DELETE /projects/:uuid
    // This action deletes a #${id} project
    @Delete(':uuid')
    async delete(@Param('uuid') id: string) {
        this.projectsService.delete(id);
        return `Project #${id} deleted`;
    }
}
