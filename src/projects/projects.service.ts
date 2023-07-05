import { Injectable } from '@nestjs/common';
import { Project, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { exclude } from 'src/utils/prisma-exclude';
import { SanitizedProject } from './types/sanitized-project.type';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private sanitizeOutput(project: Project): SanitizedProject {
    return exclude(project, ['id', 'userId']);
  }

  async create(user: User, project: CreateProjectDto): Promise<SanitizedProject> {
    return this.sanitizeOutput(await this.prisma.project.create({
      data: {
        name: project.name,
        userId: user.id,
      }
    }));
  }

  async findOne(id: string): Promise<SanitizedProject|null> {
    const project = await this.prisma.project.findUnique({
      // FIXME: ensure one can only find their projects and not somebody else's
      where: {id},
    });

    if (project) {
      return this.sanitizeOutput(project);
    } else {
      return null;
    }
  }

  async delete(id: string) {
    // FIXME: ensure the requesteer has the rights to delete the project
    await this.prisma.project.delete({
      where: {id}
    });
  }
}