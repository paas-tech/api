import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLoggerService extends ConsoleLogger {
  cError(method: string, message: string, err: unknown): void {
    super.error(`{${method}} : ${message}`);
    super.error(err); // display the full error after so we dont lose data
  }
}
