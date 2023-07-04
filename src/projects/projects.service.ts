import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Project } from '@prisma/client';
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

  async findOne(uuid: string, userId: number): Promise<SanitizedProject> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
    });
    // if user is admin, we can check
    if (user.isAdmin) {
      const project = await this.prisma.project.findFirstOrThrow({
        where: { uuid },
      });
      return project;
    }

    const project = await this.prisma.project
      .findFirstOrThrow({
        where: { userId, uuid },
      })
      .catch(() => {
        throw new NotFoundException(`Project with uuid ${uuid} not found`);
      });
    return project;
  }

  async findOneByName(name: string, userId: number): Promise<SanitizedProject> {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
    });
    // if user is admin, we can check
    if (user.isAdmin) {
      const project = await this.prisma.project.findFirstOrThrow({
        where: { name: name },
      });
      return project;
    }

    const project = await this.prisma.project.findFirst({
      where: { userId, name: name },
    });

    return project;
  }

  async delete(uuid: string, userId: number): Promise<SanitizedProject> {
    // Retrieve the project before deleting it
    const project = await this.prisma.project.findFirstOrThrow({ where: { uuid } }).catch(() => {
      throw new NotFoundException(`Project with uuid ${uuid} not found`);
    });

    // Check if user exists
    const user = await this.prisma.user.findFirstOrThrow({ where: { id: userId } }).catch(() => {
      throw new NotFoundException(`User with id ${userId} not found`);
    });

    // if user is admin we can delete the project
    if (user?.isAdmin) {
      await this.prisma.project.delete({ where: { uuid } });
      return this.sanitizeOutput(project);
    }

    // if not authorized to delete the project (not owner of project)
    if (userId !== project.userId) throw new UnauthorizedException();

    // delete the project
    await this.prisma.project.delete({ where: { uuid } }).catch(() => {
      throw new InternalServerErrorException('Could not delete the project');
    });

    return this.sanitizeOutput(project);
  }

  async findAll(userId: number): Promise<SanitizedProject[]> {
    // check if user is admin
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
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
