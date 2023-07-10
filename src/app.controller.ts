import { Controller, Get, HttpCode, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service';
import { CompliantContentResponse, StandardResponseOutput } from './types/standard-response.type';
import { Public } from './decorators/public.decorator';

type HealthReturnType = { service: string; database: string };

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('healthz')
  @Get('_health')
  @HttpCode(200)
  async getHealth(): Promise<CompliantContentResponse<HealthReturnType>> {
    if (await this.appService.getHealth()) {
      return {
        status: 'healthy',
        message: 'All systems online',
        service: 'OK',
        database: 'OK',
      };
    } else {
      /**
       * Type cast to ensure TS throws if response is not like the output.
       * As it doesn't go through an exception mapper, we need to make sure
       * that the response is compliant with the mapped responses candidates.
       */
      const response: StandardResponseOutput<HealthReturnType> = {
        status: 'unhealthy',
        message: 'Degraded mode',
        content: {
          service: 'OK',
          database: 'KO',
        },
      };
      throw new ServiceUnavailableException(response);
    }
  }
}
