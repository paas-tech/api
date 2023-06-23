import { Injectable } from '@nestjs/common';
import { Prisma, Project, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private exclude<Project, Key extends keyof Project>(project: Project, keys: Key[]): Omit<Project, Key> {
    return Object.fromEntries(
      Object.entries(project).filter(([key]) => !keys.includes(key as Key))
    ) as Omit<Project, Key>;
  }

  async create(user: User, project: CreateProjectDto): Promise<Project> {
    const timestamp: Date = new Date();

    return this.prisma.project.create({
      data: {
        name: project.name,
        uuid: uuidv4(),
        createdAt: timestamp,
        updatedAt: timestamp,
        userId: user.id,
      }
    })
  }

  async findOne(uuid: string): Promise<Omit<Project, keyof Project>|null> {
    const project = await this.prisma.project.findUnique({
      // FIXME: ensure one can only find their projects and not somebody else's
      where: {uuid},
    });

    if (project) {
      return this.exclude(project, ['id', 'userId']);
    } else {
      return null;
    }
  }

  delete(uuid: string) {
    // FIXME: ensure the requesteer has the rights to delete the project
    this.prisma.project.delete({
      where: {uuid}
    });
  }
}