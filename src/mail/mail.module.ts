import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { _InternalMailerService } from './mailer.internal.service';
import { CustomLoggerService } from 'src/logger/custom-logger.service';

@Global()
@Module({
  providers: [MailService, _InternalMailerService, CustomLoggerService],
  exports: [MailService],
})
export class MailModule {}
