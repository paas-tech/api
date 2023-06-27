import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { MailModule } from './mail/mail.module';
import { _InternalMailerService } from './mail/mailer.internal.service';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), UsersModule, ProjectsModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
