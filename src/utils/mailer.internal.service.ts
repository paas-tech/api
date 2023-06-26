import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * Used a replacement for `@nestjs-modules/mailer` while waiting for the ^10.0.0 bump.
 * This follows the guidelines described at https://github.com/nest-modules/mailer/discussions/998
 */

@Injectable()
export class _InternalMailerService {

	private transporter: nodemailer.Transporter

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.MAILER_HOST,
			port: Number(process.env.MAILER_PORT),
			secure: process.env.MAILER_SECURE === 'true',
			auth: {
				user: process.env.MAILER_USER,
				pass: process.env.MAILER_PASSWORD,
			},
		}, {
			from: process.env.MAILER_FROM,
		});
	}

	async sendMail(mailOptions: nodemailer.SendMailOptions) {
		return this.transporter.sendMail(mailOptions);
	}
}