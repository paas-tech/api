// NOT WORKING YET

import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import {
  PomegranateClient,
  StartDeploymentRequest,
  ResponseMessage,
  StopDeploymentRequest,
  RestartDeploymentRequest,
  DeploymentStatusRequest,
  ApplyConfigDeploymentRequest,
} from 'paastech-proto/types/proto/pomegranate';
import { firstValueFrom, lastValueFrom, take } from 'rxjs';
import { grpcClientOptions } from 'src/utils/grpc/grpc-client.options';

@Injectable()
export class PomegranateService implements OnModuleInit {
  @Client(grpcClientOptions)
  private readonly client: ClientGrpc;
  private pomegranateClient: PomegranateClient;

  onModuleInit(): void {
    this.pomegranateClient = this.client.getService<PomegranateClient>('Pomegranate');
  }

  async start(request: StartDeploymentRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranateClient.startDeployment(request));
    } catch (error) {
      console.log(error);
      if (error.code === 5) {
        throw new HttpException('UUID not found', 404);
      } else {
        throw new HttpException('Internal server error', 500);
      }
    }
  }

  async stop(request: StopDeploymentRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranateClient.stopDeployment(request));
    } catch (error) {
      console.log(error);
      if (error.code === 5) {
        throw new HttpException('UUID not found', 404);
      } else {
        throw new HttpException('Internal server error', 500);
      }
    }
  }

  async restart(request: RestartDeploymentRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranateClient.restartDeployment(request));
    } catch (error) {
      console.log(error);
      if (error.code === 5) {
        throw new HttpException('UUID not found', 404);
      } else {
        throw new HttpException('Internal server error', 500);
      }
    }
  }

  async delete(request: StopDeploymentRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranateClient.deleteDeployment(request));
    } catch (error) {
      console.log(error);
      if (error.code === 5) {
        throw new HttpException('UUID not found', 404);
      } else {
        throw new HttpException('Internal server error', 500);
      }
    }
  }

  async status(request: DeploymentStatusRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranateClient.deploymentStatus(request));
    } catch (error) {
      console.log(error);
      if (error.code === 5) {
        throw new HttpException('UUID not found', 404);
      } else {
        throw new HttpException('Internal server error', 500);
      }
    }
  }

  async applyConfig(request: ApplyConfigDeploymentRequest): Promise<ResponseMessage> {
    try {
      return await firstValueFrom(this.pomegranateClient.applyConfigDeployment(request));
    } catch (error) {
      console.log(error);
      if (error.code === 5) {
        throw new HttpException('UUID not found', 404);
      } else {
        throw new HttpException('Internal server error', 500);
      }
    }
  }
}
