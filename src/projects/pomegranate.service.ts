import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import {
  PomegranateClient,
  DeployRequest,
  DeleteImageRequest,
  EmptyResponse,
  GetStatusRequest,
  GetStatusResponse,
  GetStatisticsRequest,
  GetStatisticsResponse,
  GetLogsRequest,
  GetLogsResponse,
  StopDeployRequest,
} from 'paastech-proto/types/proto/pomegranate';
import { firstValueFrom } from 'rxjs';
import { grpcClientOptions } from 'src/utils/grpc/grpc-client.options';

@Injectable()
export class PomegranateService implements OnModuleInit {
  @Client(grpcClientOptions['pomegranate'])
  private readonly client: ClientGrpc;
  private pomegranate: PomegranateClient;
  onModuleInit(): void {
    this.pomegranate = this.client.getService<PomegranateClient>('Pomegranate');
  }

  async deploy(request: DeployRequest): Promise<EmptyResponse> {
    try {
      return await firstValueFrom(this.pomegranate.deploy(request));
    } catch (error) {
      if (error.code === 5) {
        throw new HttpException('Image not found', 404);
      }
      throw new HttpException(`Internal server error: ${error}`, 500);
    }
  }

  async stopDeployment(request: StopDeployRequest): Promise<EmptyResponse> {
    try {
      return await firstValueFrom(this.pomegranate.stopDeploy(request));
    } catch (error) {
      if (error.code === 5) {
        throw new HttpException('Deployment not found', 404);
      }
      throw new HttpException(`Internal server error: ${error}`, 500);
    }
  }

  async deleteImage(request: DeleteImageRequest): Promise<EmptyResponse> {
    try {
      return await firstValueFrom(this.pomegranate.deleteImage(request));
    } catch (error) {
      if (error.code === 5) {
        throw new HttpException('Image not found', 404);
      }
      throw new HttpException(`Internal server error: ${error}`, 500);
    }
  }

  async getLogs(request: GetLogsRequest): Promise<GetLogsResponse> {
    try {
      return await firstValueFrom(this.pomegranate.getLogs(request));
    } catch (error) {
      if (error.code === 5) {
        throw new HttpException('Deployment not found', 404);
      }
      throw new HttpException(`Internal server error: ${error}`, 500);
    }
  }

  async getStatistics(request: GetStatisticsRequest): Promise<GetStatisticsResponse> {
    try {
      return await firstValueFrom(this.pomegranate.getStatistics(request));
    } catch (error) {
      if (error.code === 5) {
        throw new HttpException('Deployment not found', 404);
      }
      throw new HttpException(`Internal server error: ${error}`, 500);
    }
  }

  async getStatus(request: GetStatusRequest): Promise<GetStatusResponse> {
    try {
      return await firstValueFrom(this.pomegranate.getStatus(request));
    } catch (error) {
      if (error.code === 5) {
        throw new HttpException('Deployment not found', 404);
      }
      throw new HttpException(`Internal server error: ${error}`, 500);
    }
  }
}
