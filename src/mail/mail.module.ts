import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { _InternalMailerService } from './mailer.internal.service';

@Global()
@Module({
  providers: [MailService, _InternalMailerService],
  exports: [MailService],
})
export class MailModule {}
