import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { exclude } from 'src/utils/prisma-exclude';
import { SanitizedProject } from './types/sanitized-project.type';
import { GitRepoManagerService } from './git-repo-manager.service';
import { RepositoryRequest } from 'paastech-proto/types/proto/git-repo-manager';
import { createRepositoryRequest } from 'src/utils/grpc/grpc-request-helpers';
import {
  ApplyConfigDeploymentRequest,
  DeleteDeploymentRequest,
  DeploymentLogRequest,
  DeploymentStatRequest,
  DeploymentStatusRequest,
  ResponseMessage,
  ResponseMessageStatus,
  RestartDeploymentRequest,
  StartDeploymentRequest,
  StopDeploymentRequest,
} from 'paastech-proto/types/proto/pomegranate';
import { PomegranateService } from './pomegranate.service';

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
    // Retrieve the project before deleting it
    const project = await this.prisma.project.findFirstOrThrow({ where: { id: projectId } }).catch(() => {
      throw new NotFoundException(`Project with uuid ${projectId} not found`);
    });

    // Check if user exists
    const user = await this.prisma.user.findFirstOrThrow({ where: { id: userId } }).catch(() => {
      throw new NotFoundException(`User with id ${userId} not found`);
    });

    return await this.prisma.$transaction(async (tx) => {
      // if not authorized to delete the project (not owner of project)
      if (!user.isAdmin && userId !== project.userId) throw new UnauthorizedException();

      // delete the project
      await tx.project.delete({ where: { id: projectId } }).catch(() => {
        throw new InternalServerErrorException(`Failed to delete project ${projectId}`);
      });

      // Send the grpc request to delete the repository
      const repositoryRequest: RepositoryRequest = createRepositoryRequest(projectId);
      try {
        await this.gitRepoManagerService.delete(repositoryRequest);
      } catch (e) {
        throw new InternalServerErrorException(`Failed to delete repository for project ${projectId}: ${e}`);
      }

      // TODO delete deployments

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

  async startDeployment(projectId: string, userId: string): Promise<ResponseMessage> {
    // Send the grpc request to start the deployment

    const startDeploymentRequest: StartDeploymentRequest = {
      deployment_uuid: 'TODO',
      project_uuid: projectId,
      user_uuid: userId,
    };
    try {
      return await this.pomegranateService.startDeployment(startDeploymentRequest);
    } catch (e) {
      throw new InternalServerErrorException(`Failed to delete repository for project ${projectId}: ${e}`);
    }
  }

  async restartDeployment(projectId: string, userId: string): Promise<ResponseMessage> {
    // Send the grpc request to start the deployment

    const restartDeploymentRequest: RestartDeploymentRequest = {
      deployment_uuid: 'TODO',
      project_uuid: projectId,
      user_uuid: userId,
    };
    try {
      return await this.pomegranateService.restartDeployment(restartDeploymentRequest);
    } catch (e) {
      throw new InternalServerErrorException(`Failed to delete repository for project ${projectId}: ${e}`);
    }
  }

  async stopDeployment(projectId: string, userId: string): Promise<ResponseMessage> {
    // Send the grpc request to start the deployment

    const stopDeploymentRequest: StopDeploymentRequest = {
      deployment_uuid: 'TODO',
      project_uuid: projectId,
    };
    try {
      return await this.pomegranateService.stopDeployment(stopDeploymentRequest);
    } catch (e) {
      throw new InternalServerErrorException(`Failed to delete repository for project ${projectId}: ${e}`);
    }
  }

  async deploymentStatus(projectId: string, userId: string): Promise<ResponseMessageStatus> {
    // Send the grpc request to start the deployment

    const deploymentStatusRequest: DeploymentStatusRequest = {
      deployment_uuid: 'TODO',
      project_uuid: projectId,
    };
    try {
      return await this.pomegranateService.deploymentStatus(deploymentStatusRequest);
    } catch (e) {
      throw new InternalServerErrorException(`Failed to delete repository for project ${projectId}: ${e}`);
    }
  }

  async deploymentLog(projectId: string, userId: string): Promise<ResponseMessage> {
    // Send the grpc request to start the deployment

    const deploymentLogRequest: DeploymentLogRequest = {
      deployment_uuid: 'TODO',
      project_uuid: projectId,
    };
    try {
      return await this.pomegranateService.deploymentLog(deploymentLogRequest);
    } catch (e) {
      throw new InternalServerErrorException(`Failed to delete repository for project ${projectId}: ${e}`);
    }
  }

  async deploymentStat(projectId: string, userId: string): Promise<ResponseMessage> {
    // Send the grpc request to start the deployment

    const deploymentStatRequest: DeploymentStatRequest = {
      deployment_uuid: 'TODO',
      project_uuid: projectId,
    };
    try {
      return await this.pomegranateService.deploymentStat(deploymentStatRequest);
    } catch (e) {
      throw new InternalServerErrorException(`Failed to delete repository for project ${projectId}: ${e}`);
    }
  }

  async applyConfigDeployment(projectId: string, userId: string): Promise<ResponseMessage> {
    // Send the grpc request to start the deployment

    const applyConfigDeploymentRequest: ApplyConfigDeploymentRequest = {
      deployment_uuid: 'TODO',
      project_uuid: projectId,
      user_uuid: userId,
      config: 'TODO',
    };
    try {
      return await this.pomegranateService.applyConfigDeployment(applyConfigDeploymentRequest);
    } catch (e) {
      throw new InternalServerErrorException(`Failed to delete repository for project ${projectId}: ${e}`);
    }
  }
}
