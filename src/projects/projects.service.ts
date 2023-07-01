import { Injectable, NotFoundException } from '@nestjs/common';
import { Project, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { v4 as uuidv4 } from 'uuid';
import { exclude } from 'src/utils/prisma-exclude';
import { SanitizedProject } from './types/sanitized-project.type';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private sanitizeOutput(project: Project): SanitizedProject {
    return exclude(project, ['id', 'userId']);
  }

  async create(userId: number, project: CreateProjectDto): Promise<SanitizedProject> {
    const createdProject = await this.prisma.project.create({
      data: {
        name: project.name,
        uuid: uuidv4(),
        userId: userId,
      },
    });

    const sanitizedOutput = this.sanitizeOutput(createdProject);

    return {
      ...sanitizedOutput,
      uuid: createdProject.uuid,
    };
  }

  async findOne(uuid: string, userId: number): Promise<SanitizedProject | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // if user is admin, we can check
    if (user.isAdmin) {
      return (
        (await this.prisma.project.findFirst({
          where: { uuid },
        })) ?? null
      );
    }

    return (
      (await this.prisma.project.findFirst({
        where: { userId, uuid },
      })) ?? null
    );
  }

  async findOneByName(name: string, userId: number): Promise<SanitizedProject | null> {
    const project = await this.prisma.project.findFirst({
      where: { userId, name: name },
    });
    return project ?? null;
  }

  async delete(uuid: string) {
    // Retrieve the project before deleting it
    const project = await this.prisma.project.findFirst({
      where: { uuid },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Delete the project
    await this.prisma.project.delete({
      where: { uuid },
    });

    return project;
  }

  async findAll(userId: number): Promise<SanitizedProject[]> {
    // check if user is admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // If the user is admin we return every project in the database
    if (user.isAdmin) {
      const projects = await this.prisma.project.findMany();
      return projects.map((project) => project);
    }

    const projects = await this.prisma.project.findMany({
      where: { userId },
    });

    return projects.map((project) => this.sanitizeOutput(project));
  }
}
