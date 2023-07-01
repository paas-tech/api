import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { GitRepoManagerClient, RepositoryRequest, RepositoryResponse } from 'paastech-proto/types/proto/git-repo-manager';
import { firstValueFrom } from 'rxjs';
import { grpcClientOptions } from 'src/utils/grpc/grpc-client.options';

@Injectable()
export class GitRepoManagerService implements OnModuleInit {
  @Client(grpcClientOptions)
  private readonly client: ClientGrpc;
  private gitRepoManager: GitRepoManagerClient;

  onModuleInit(): void {
    this.gitRepoManager = this.client.getService<GitRepoManagerClient>('GitRepoManager');
  }

  async create(request: RepositoryRequest): Promise<RepositoryResponse> {
    try {
      return await firstValueFrom(this.gitRepoManager.createRepository(request));
    } catch (error) {
      if (error.code === 6) {
        throw new HttpException('Repository already exists', 409);
      } else {
        throw new HttpException('Internal server error', 500);
      }
    }
  }

  async delete(request: RepositoryRequest): Promise<RepositoryResponse> {
    try {
      return await firstValueFrom(this.gitRepoManager.deleteRepository(request));
    } catch (error) {
      if (error.code === 5) {
        throw new HttpException('Repository not found', 404);
      } else {
        throw new HttpException('Internal server error', 500);
      }
    }
  }
}
