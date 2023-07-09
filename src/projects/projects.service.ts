import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { exclude } from 'src/utils/prisma-exclude';
import { SanitizedProject } from './types/sanitized-project.type';
import { GitRepoManagerService } from './git-repo-manager.service';
import { RepositoryRequest } from 'paastech-proto/types/proto/git-repo-manager';
import { createRepositoryRequest } from 'src/utils/grpc/grpc-request-helpers';
import {
  ContainerStatus,
  DeleteImageRequest,
  DeployRequest,
  EmptyResponse,
  GetLogsRequest,
  GetLogsResponse,
  GetStatisticsRequest,
  GetStatisticsResponse,
  GetStatusRequest,
  GetStatusResponse,
  StopDeployRequest,
} from 'paastech-proto/types/proto/pomegranate';
import { PomegranateService } from './pomegranate.service';
import { env } from 'process';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService, private gitRepoManagerService: GitRepoManagerService, private pomegranateService: PomegranateService) {}

  private sanitizeOutput(project: Project): SanitizedProject {
    return exclude(project, ['userId']);
  }

  async create(userId: string, name: string): Promise<SanitizedProject> {
    // Retrieve the project before deleting it
    const project = await this.prisma.project.findFirst({ where: { name } });

    if (project) {
      throw new ConflictException(`Project with name ${name} already exists`);
    }
    return await this.prisma.$transaction(async (tx) => {
      const createdProject = await tx.project.create({
        data: {
          name,
          userId: userId,
        },
      });

      const repositoryRequest: RepositoryRequest = createRepositoryRequest(createdProject.id);

      try {
        await this.gitRepoManagerService.create(repositoryRequest);
      } catch (e) {
        throw new InternalServerErrorException(`Failed to create repository for project ${createdProject.id}`);
      }

      return this.sanitizeOutput(createdProject);
    });
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
    const project = await this.userAndProjectCheck(projectId, userId);

    return await this.prisma.$transaction(async (tx) => {
      // delete the project
      await tx.project.delete({ where: { id: projectId } }).catch(() => {
        throw new InternalServerErrorException(`Failed to delete project ${projectId}`);
      });

      try {
        const deleteImageRequest: DeleteImageRequest = {
          container_name: projectId,
          image_name: projectId,
          image_tag: 'latest',
        };
        await this.pomegranateService.deleteImage(deleteImageRequest);
      } catch (e) {
        // If the image does not exist, we do not throw an error
        if (e.status !== 404) {
          throw new InternalServerErrorException(`Failed to delete the image for project ${projectId}: ${e}`);
        }
      }
      try {
        // Send the grpc request to delete the repository
        const repositoryRequest: RepositoryRequest = createRepositoryRequest(projectId);
        await this.gitRepoManagerService.delete(repositoryRequest);
      } catch (e) {
        throw new InternalServerErrorException(`Failed to delete repository for project ${projectId}: ${e}`);
      }
      return this.sanitizeOutput(project);
    });
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

  // POMEGRANATE

  async deploy(projectId: string, userId: string, envVars: Record<string, string>): Promise<EmptyResponse> {
    return await this.prisma.$transaction(async (tx) => {
      await this.userAndProjectCheck(projectId, userId);

      await tx.project.update({
        where: { id: projectId },
        data: {
          config: {
            env: envVars,
          },
        },
      });

      const deployRequest: DeployRequest = {
        container_name: projectId,
        image_name: projectId,
        image_tag: 'latest',
        env_vars: envVars,
      };
      return await this.pomegranateService.deploy(deployRequest);
    });
  }

  async stopDeployment(projectId: string, userId: string): Promise<EmptyResponse> {
    await this.userAndProjectCheck(projectId, userId);

    const stopDeploymentRequest: StopDeployRequest = {
      container_name: projectId,
    };
    return await this.pomegranateService.stopDeployment(stopDeploymentRequest);
  }

  async getDeploymentLogs(projectId: string, userId: string): Promise<GetLogsResponse> {
    await this.userAndProjectCheck(projectId, userId);

    const getLogsRequest: GetLogsRequest = {
      container_name: projectId,
    };
    return await this.pomegranateService.getLogs(getLogsRequest);
  }

  async getStatistics(projectId: string, userId: string): Promise<GetStatisticsResponse> {
    await this.userAndProjectCheck(projectId, userId);

    const getStatisticsRequest: GetStatisticsRequest = {
      container_name: projectId,
    };
    return await this.pomegranateService.getStatistics(getStatisticsRequest);
  }

  async getStatus(projectId: string[], userId: string): Promise<GetStatusResponse> {
    for (const id of projectId) {
      await this.userAndProjectCheck(id, userId);
    }
    const getStatusRequest: GetStatusRequest = {
      container_name: projectId,
    };
    return await this.pomegranateService.getStatus(getStatusRequest);
  }

  async userAndProjectCheck(projectId: string, userId: string): Promise<Project> {
    const user = await this.prisma.user.findFirstOrThrow({ where: { id: userId } }).catch(() => {
      throw new NotFoundException(`User with id ${userId} not found`);
    });

    // Check if the project exists
    const project = await this.prisma.project.findFirstOrThrow({ where: { id: projectId } }).catch(() => {
      throw new NotFoundException(`Project with uuid ${projectId} not found`);
    });

    // if not authorized to stop the project (not owner of project)
    if (!user.isAdmin && userId !== project.userId) throw new UnauthorizedException();
    return project;
  }
}
