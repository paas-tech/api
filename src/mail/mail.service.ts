import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { _InternalMailerService as MailerService } from './mailer.internal.service';
import { compile } from 'handlebars';
import { ConfigService } from '@nestjs/config';

const EMAIL_CONFIRMATION_TEMPLATE = `<h2>Welcome to PaasTech!</h2>
<p>Please click the link below to confirm your email:</p>
<p>
    <a href="{{ url }}">Confirm</a>
</p>

<p>If you have trouble opening the link, you can copy the following URL into your browser: </p>
<p>{{ url }}</p>

<p>If you did not request this email you can safely ignore it.</p>`;

@Injectable()
export class MailService {

    private hostname: string;

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {
        this.hostname = `${this.configService.getOrThrow('APP_HOST')}:${this.configService.getOrThrow('APP_PORT')}`;
    }

    async sendUserConfirmation(user: User, token: string) {
        const url = `${this.hostname}/auth/confirm?token=${token}`;
        const template = compile(EMAIL_CONFIRMATION_TEMPLATE);
    
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Welcome to PaasTech!',
            html: template({url}),

            // TODO: use @nestjs-modules/mailer once bumped to 10.0.0

            //template: './confirmation',
            //context: {
            //    url,
            //},
        });
    }

}
