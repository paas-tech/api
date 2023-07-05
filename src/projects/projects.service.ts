import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { exclude } from 'src/utils/prisma-exclude';
import { SanitizedProject } from './types/sanitized-project.type';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private sanitizeOutput(project: Project): SanitizedProject {
    return exclude(project, ['userId']);
  }

  async create(userId: string, name: string): Promise<SanitizedProject> {
    // Retrieve the project before deleting it
    const project = await this.prisma.project.findFirst({ where: { name } });

    if (project) {
      throw new ConflictException(`Project with name ${name} already exists`);
    }

    const createdProject = await this.prisma.project.create({
      data: {
        name,
        userId: userId,
      },
    });

    return this.sanitizeOutput(createdProject);
  }

  async findOne(projectId: string, userId: string): Promise<SanitizedProject> {
    const user = await this.prisma.user
      .findFirstOrThrow({
        where: { id: userId },
      })
      .catch(() => {
        throw new NotFoundException(`User with uuid ${userId} not found`);
      });
    // if user is admin, we can check
    if (user.isAdmin) {
      const project = await this.prisma.project
        .findFirstOrThrow({
          where: { id: projectId },
        })
        .catch(() => {
          throw new NotFoundException(`Project with uuid ${projectId} not found`);
        });
      return project;
    }

    const project = await this.prisma.project
      .findFirstOrThrow({
        where: { userId, id: projectId },
      })
      .catch(() => {
        throw new NotFoundException(`Project with uuid ${projectId} not found`);
      });
    return project;
  }

  async findOneByName(name: string, userId: string): Promise<SanitizedProject> {
    const user = await this.prisma.user
      .findFirstOrThrow({
        where: { id: userId },
      })
      .catch(() => {
        throw new NotFoundException(`User with uuid ${userId} not found`);
      });
    // if user is admin, we can check
    if (user.isAdmin) {
      const project = await this.prisma.project
        .findFirstOrThrow({
          where: { name: name },
        })
        .catch(() => {
          throw new NotFoundException(`Project with name ${name} not found`);
        });
      return project;
    }

    const project = await this.prisma.project
      .findFirstOrThrow({
        where: { userId, name: name },
      })
      .catch(() => {
        throw new NotFoundException(`Project with name ${name} not found`);
      });

    return project;
  }

  async delete(projectId: string, userId: string): Promise<SanitizedProject> {
    // Retrieve the project before deleting it
    const project = await this.prisma.project.findFirstOrThrow({ where: { id: projectId } }).catch(() => {
      throw new NotFoundException(`Project with uuid ${projectId} not found`);
    });

    // Check if user exists
    const user = await this.prisma.user.findFirstOrThrow({ where: { id: userId } }).catch(() => {
      throw new NotFoundException(`User with id ${userId} not found`);
    });

    // if user is admin we can delete the project
    if (user?.isAdmin) {
      await this.prisma.project.delete({ where: { id: projectId } });
      return this.sanitizeOutput(project);
    }

    // if not authorized to delete the project (not owner of project)
    if (userId !== project.userId) throw new UnauthorizedException();

    // delete the project
    await this.prisma.project.delete({ where: { id: projectId } }).catch(() => {
      throw new InternalServerErrorException('Could not delete the project');
    });

    return this.sanitizeOutput(project);
  }

  async findAll(userId: string): Promise<SanitizedProject[]> {
    // check if user is admin
    const user = await this.prisma.user
      .findFirstOrThrow({
        where: { id: userId },
      })
      .catch(() => {
        throw new NotFoundException(`User with id ${userId} not found`);
      });

    // If the user is admin we return every project in the database
    if (user.isAdmin) {
      const projects = await this.prisma.project.findMany();
      return projects.map((project) => this.sanitizeOutput(project));
    }

    const projects = await this.prisma.project.findMany({
      where: { userId },
    });

    return projects.map((project) => this.sanitizeOutput(project));
  }
}
