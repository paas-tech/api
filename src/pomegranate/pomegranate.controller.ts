// import { Controller, Post, Query, BadRequestException, Get } from '@nestjs/common';
// import {
//   ApplyConfigDeploymentRequest,
//   DeleteDeploymentRequest,
//   DeploymentStatusRequest,
//   ResponseMessage,
//   RestartDeploymentRequest,
//   StartDeploymentRequest,
//   StopDeploymentRequest,
// } from 'paastech-proto/types/proto/pomegranate';

// // import { PomegranateService } from './pomegranate.service';

// @Controller('pomegranate')
// export class PomegranateController {
//   constructor(private pomegranateService: PomegranateService) {}

//   @Get('start')
//   async startDeployment(
//     @Query('deployment_uuid') deploymentUuid: string,
//     @Query() request: StartDeploymentRequest,
//   ): Promise<ResponseMessage> {
//     if (!deploymentUuid) {
//       throw new BadRequestException('deployment_uuid argument is missing in the query string');
//     }
//     return this.pomegranateService.start(request);
//   }

//   @Get('stop')
//   async stopDeployment(
//     @Query('deployment_uuid') deploymentUuid: string,
//     @Query() request: StopDeploymentRequest,
//   ): Promise<ResponseMessage> {
//     if (!deploymentUuid) {
//       throw new BadRequestException('deployment_uuid argument is missing in the query string');
//     }
//     return this.pomegranateService.stop(request);
//   }

//   @Get('restart')
//   async restartDeployment(
//     @Query('deployment_uuid') deploymentUuid: string,
//     @Query() request: RestartDeploymentRequest,
//   ): Promise<ResponseMessage> {
//     if (!deploymentUuid) {
//       throw new BadRequestException('deployment_uuid argument is missing in the query string');
//     }
//     return this.pomegranateService.restart(request);
//   }

//   @Get('delete')
//   async deleteDeployment(
//     @Query('deployment_uuid') deploymentUuid: string,
//     @Query() request: DeleteDeploymentRequest,
//   ): Promise<ResponseMessage> {
//     if (!deploymentUuid) {
//       throw new BadRequestException('deployment_uuid argument is missing in the query string');
//     }
//     return this.pomegranateService.delete(request);
//   }

//   @Get('status')
//   async statusDeployment(
//     @Query('deployment_uuid') deploymentUuid: string,
//     @Query() request: DeploymentStatusRequest,
//   ): Promise<ResponseMessage> {
//     if (!deploymentUuid) {
//       throw new BadRequestException('deployment_uuid argument is missing in the query string');
//     }
//     return this.pomegranateService.status(request);
//   }

//   @Get('apply-config')
//   async applyConfig(
//     @Query('deployment_uuid') deploymentUuid: string,
//     @Query('config') config: string,
//     @Query() request: ApplyConfigDeploymentRequest,
//   ): Promise<ResponseMessage> {
//     if (!deploymentUuid) {
//       throw new BadRequestException('deployment_uuid argument is missing in the query string');
//     }
//     if (!config) {
//       throw new BadRequestException('config argument is missing in the query string');
//     }
//     return this.pomegranateService.applyConfig(request);
//   }
// }
