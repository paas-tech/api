import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
    // GET /projects
    @Get()
    findAll() {
        return `This action returns all of the authenticated user's projects`
    }

    // GET /projects/:uuid
    @Get(':uuid')
    findOne(@Param('uuid') id: string) {
        return `This action returns a #${id} project`;
    }

    // POST /projects
    @Post()
    create(@Body() createProjectDto: CreateProjectDto) {
        return `This action creates a project
                and returns a NewProject Object
                with the project's id and name`;
    }

    // DELETE /projects/:uuid
    @Delete(':uuid')
    delete(@Param('uuid') id: string) {
        return `This action deletes a #${id} project`;
    }
}
