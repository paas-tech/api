import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { _InternalMailerService } from 'src/utils/mailer.internal.service';

@Module({
  imports: [_InternalMailerService],
  providers: [MailService]
})
export class MailModule {}
