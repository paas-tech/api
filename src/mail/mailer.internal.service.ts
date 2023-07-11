import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Used a replacement for `@nestjs-modules/mailer` while waiting for the ^10.0.0 bump.
 * This follows the guidelines described at https://github.com/nest-modules/mailer/discussions/998
 */

@Injectable()
export class _InternalMailerService {
  private transporter: nodemailer.Transporter;

  constructor(configService: ConfigService) {
    this.transporter = nodemailer.createTransport(
      {
        host: configService.getOrThrow('MAILER_HOST'),
        port: Number(configService.getOrThrow('MAILER_PORT')),
        secure: configService.getOrThrow('MAILER_SECURE') === 'true',
        auth: {
          user: configService.getOrThrow('MAILER_USER'),
          pass: configService.getOrThrow('MAILER_PASSWORD'),
        },
      },
      {
        from: configService.getOrThrow('MAILER_FROM'),
      },
    );
  }

  async sendMail(mailOptions: nodemailer.SendMailOptions) {
    return this.transporter.sendMail(mailOptions);
  }
}
