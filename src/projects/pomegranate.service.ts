import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import {
  ApplyConfigDeploymentRequest,
  DeleteDeploymentRequest,
  DeploymentLogRequest,
  DeploymentStatRequest,
  DeploymentStats,
  DeploymentStatusRequest,
  PomegranateClient,
  ResponseMessage,
  ResponseMessageStatus,
  RestartDeploymentRequest,
  StartDeploymentRequest,
  StopDeploymentRequest,
} from 'paastech-proto/types/proto/pomegranate';
import { firstValueFrom } from 'rxjs';
import { grpcClientOptions } from 'src/utils/grpc/grpc-client.options';

@Injectable()
export class PomegranateService implements OnModuleInit {
  @Client(grpcClientOptions[1])
  private readonly client: ClientGrpc;
  private pomegranate: PomegranateClient;
  onModuleInit(): void {
    this.pomegranate = this.client.getService<PomegranateClient>('Pomegranate');
  }

  async startDeployment(request: StartDeploymentRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranate.startDeployment(request));
    } catch (error) {
      // TODO
      if (error.code === 6) {
        throw new HttpException('Repository already exists', 409);
      } else {
        throw new HttpException(`Internal server error: ${error}`, 500);
      }
    }
  }
  async restartDeployment(request: RestartDeploymentRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranate.restartDeployment(request));
    } catch (error) {
      // TODO
      if (error.code === 6) {
        throw new HttpException('Repository already exists', 409);
      } else {
        throw new HttpException(`Internal server error: ${error}`, 500);
      }
    }
  }
  async deleteDeployment(request: DeleteDeploymentRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranate.deleteDeployment(request));
    } catch (error) {
      // TODO
      if (error.code === 6) {
        throw new HttpException('Repository already exists', 409);
      } else {
        throw new HttpException(`Internal server error: ${error}`, 500);
      }
    }
  }

  async stopDeployment(request: StopDeploymentRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranate.stopDeployment(request));
    } catch (error) {
      // TODO
      if (error.code === 6) {
        throw new HttpException('Repository already exists', 409);
      } else {
        throw new HttpException(`Internal server error: ${error}`, 500);
      }
    }
  }

  async deploymentStatus(request: DeploymentStatusRequest): Promise<ResponseMessageStatus> {
    try {
      return await firstValueFrom(this.pomegranate.deploymentStatus(request));
    } catch (error) {
      // TODO
      if (error.code === 6) {
        throw new HttpException('Repository already exists', 409);
      } else {
        throw new HttpException(`Internal server error: ${error}`, 500);
      }
    }
  }

  async deploymentLog(request: DeploymentLogRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranate.deploymentStatus(request));
    } catch (error) {
      // TODO
      if (error.code === 6) {
        throw new HttpException('Repository already exists', 409);
      } else {
        throw new HttpException(`Internal server error: ${error}`, 500);
      }
    }
  }

  async deploymentStat(request: DeploymentStatRequest): Promise<DeploymentStats> {
    try {
      return await firstValueFrom(this.pomegranate.deploymentStat(request));
    } catch (error) {
      // TODO
      if (error.code === 6) {
        throw new HttpException('Repository already exists', 409);
      } else {
        throw new HttpException(`Internal server error: ${error}`, 500);
      }
    }
  }

  async applyConfigDeployment(request: ApplyConfigDeploymentRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranate.applyConfigDeployment(request));
    } catch (error) {
      // TODO
      if (error.code === 6) {
        throw new HttpException('Repository already exists', 409);
      } else {
        throw new HttpException(`Internal server error: ${error}`, 500);
      }
    }
  }
}
