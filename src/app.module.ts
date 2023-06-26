import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { MailModule } from './mail/mail.module';
import { _InternalMailerService } from './utils/mailer.internal.service';

@Module({
  imports: [UsersModule, ProjectsModule, MailModule],
  controllers: [AppController],
  providers: [AppService, _InternalMailerService],
  exports: [_InternalMailerService],
})
export class AppModule {}
