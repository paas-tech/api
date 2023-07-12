import { Injectable } from '@nestjs/common';
import { _InternalMailerService as MailerService } from './mailer.internal.service';
import { compile } from 'handlebars';
import { ConfigService } from '@nestjs/config';
import Mail from 'nodemailer/lib/mailer';
import { CustomLoggerService } from 'src/logger/custom-logger.service';

const EMAIL_CONFIRMATION_TEMPLATE = `<h2>Welcome to PaasTech!</h2>
<p>Please click the link below to confirm your email:</p>
<p>
    <a href="{{ url }}">Confirm</a>
</p>

<p>If you have trouble opening the link, you can copy the following URL into your browser: </p>
<p>{{ url }}</p>

<p>If you did not request this email, you can safely ignore it.</p>`;

const PASSWORD_RESET_TEMPLATE = `<h2>Password reset</h2>
<p>Please click the link below to reset your password:</p>
<p>
    <a href="{{ url }}">Reset password</a>
</p>

<p>If you have trouble opening the link, you can copy the following URL into your browser: </p>
<p>{{ url }}</p>

<p>If you did not request this email, please contact us immediately.</p>`;

@Injectable()
export class MailService {
  private hostname: string;

  constructor(private readonly mailerService: MailerService, private readonly configService: ConfigService, private readonly logger: CustomLoggerService) {
    this.hostname = this.configService.getOrThrow('FRONTEND_ORIGIN');
  }

  private async sendMail(options: Mail.Options): Promise<boolean> {
    return await this.mailerService
      .sendMail(options)
      .then(() => {
        return true;
      })
      .catch((e) => {
        this.logger.cError(this.sendMail.name, 'Failed to send mail', e);
        return false;
      });
  }

  async sendUserConfirmation(email: string, token: string): Promise<boolean> {
    const url = `${this.hostname}/#/email-verification/${token}`;
    const template = compile(EMAIL_CONFIRMATION_TEMPLATE);

    return this.sendMail({
      from: `${this.configService.getOrThrow('MAILER_FROM')}`,
      to: email,
      subject: 'Welcome to PaaSTech!',
      html: template({ url }),

      // TODO: use @nestjs-modules/mailer once bumped to 10.0.0

      //template: './confirmation',
      //context: {
      //    url,
      //},
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `${this.hostname}/#/password-reset/${token}`;
    const template = compile(PASSWORD_RESET_TEMPLATE);

    await this.sendMail({
      from: `${this.configService.getOrThrow('MAILER_FROM')}`,
      to: email,
      subject: '[PaaSTech] Password reset',
      html: template({ url }),

      // TODO: use @nestjs-modules/mailer once bumped to 10.0.0

      //template: './password-reset',
      //context: {
      //    url,
      //},
    });
  }
}
