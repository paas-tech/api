import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma } from '@prisma/client';
import { SanitizedUser } from './types/sanitized-user.type';
import { exclude } from 'src/utils/prisma-exclude';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { StandardResponseOutput } from 'src/types/standard-response.type';
import { CustomLoggerService } from 'src/logger/custom-logger.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private readonly mailService: MailService, private readonly logger: CustomLoggerService) {}

  public sanitizeOutput(user: User): SanitizedUser {
    return exclude(user, ['id', 'emailNonce', 'passwordNonce', 'password', 'createdAt', 'updatedAt']);
  }

  private async passwd_encrypt(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async create(user: CreateUserDto): Promise<User> {
    return await this.prisma.$transaction(async (tx) => {
      // add the user
      const created = await tx.user.create({
        data: {
          username: user.username,
          email: user.email,
          password: await this.passwd_encrypt(user.password),
          isAdmin: false,
        },
      });

      const emailSent = await this.mailService.sendUserConfirmation(created.email, created.emailNonce);

      if (!emailSent) {
        throw new ServiceUnavailableException({
          status: 'aborted',
          message: 'An error occured during email sending and the registration was thus cancelled. Please retry later.',
        } as StandardResponseOutput<Record<string, never>>);
      }

      return created;
    });
  }

  async validateEmail(email: string): Promise<boolean> {
    // Check that email address doesn't already exist in the db
    return !(await this.findOne({ email }));
  }

  async validateEmailNonce(email_nonce: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: {
          emailNonce: email_nonce,
        },
        data: {
          emailNonce: null,
        },
      });
      return true;
    } catch (err) {
      this.logger.cError(this.validateEmailNonce.name, `Failed to validate email with nonce '${email_nonce}'`, err);
      return false;
    }
  }

  async updatePassword(id: string, password: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          passwordNonce: null,
          password: await this.passwd_encrypt(password),
        },
      });
      return true;
    } catch (err) {
      this.logger.cError(this.updatePassword.name, `Failed to update password for user '${id}'`, err);
      return false;
    }
  }

  async regeneratePasswordNonce(id: string): Promise<string> {
    try {
      const passwordNonce = uuidv4();
      await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          passwordNonce: passwordNonce,
        },
      });
      return passwordNonce;
    } catch (err) {
      this.logger.cError(this.regeneratePasswordNonce.name, `Failed to regenerate password nonce for user '${id}'`, err);
      return null;
    }
  }

  async validateUsername(username: string): Promise<boolean> {
    // Check that username doesn't already exist
    return !(await this.findOne({ username }));
  }

  async findOne(userUniqueInput: Prisma.UserWhereUniqueInput): Promise<SanitizedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: userUniqueInput,
    });

    if (user) {
      return this.sanitizeOutput(user);
    } else {
      return null;
    }
  }

  async findAll(): Promise<SanitizedUser[] | []> {
    const users = await this.prisma.user.findMany();
    const sanitizedUsers = [];
    for (const user of users) {
      sanitizedUsers.push(this.sanitizeOutput(user));
    }
    return sanitizedUsers;
  }

  async findOneUnsanitized(userUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userUniqueInput,
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.delete({ where });
  }
}
