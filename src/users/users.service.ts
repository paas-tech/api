import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { SetSshDto } from 'src/users/dto/set-ssh.dto';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma } from '@prisma/client';
import { SanitizedUser } from './types/sanitized-user.type';
import { exclude } from 'src/utils/prisma-exclude';
import * as bcrypt from 'bcrypt';
import { EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from 'src/utils/constants';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private sanitizeOutput(user: User): SanitizedUser {
    return exclude(user, ['id', 'email_nonce', 'password', 'createdAt', 'updatedAt']);
  }

  private async passwd_encrypt(password: string): Promise<string> {
    const saltOrRounds = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  async create(user: CreateUserDto): Promise<SanitizedUser> {
    return this.sanitizeOutput(await this.prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: await this.passwd_encrypt(user.password),
        isAdmin: false,
      }
    }));
  }

  async validateEmail(email: string): Promise<boolean> {
    // Verify if email form is valid
    const expression: RegExp = EMAIL_REGEX;
    const isValidRegex: boolean = expression.test(email);

    if (isValidRegex) {
        // Check that email address doesn't already exist in the db
        const user = await this.findOne({email});
        return !user;
    }
    return false;
  }

  async validateUsername(username: string): Promise<boolean> {
    // Verify if username form is valid
    const expression: RegExp = USERNAME_REGEX;
    const isValidRegex: boolean = expression.test(username);

    if (isValidRegex) {
        // Check that username doesn't already exist in the db
        const user = await this.findOne({username});
        return !user;
    }
    return false;
  }

  async validatePassword(password: string): Promise<boolean> {
    const expression: RegExp = PASSWORD_REGEX;
    return(expression.test(password));
  }

  async findOne(userUniqueInput: Prisma.UserWhereUniqueInput): Promise<SanitizedUser|null> {
    const user = await this.prisma.user.findUnique({
      where: userUniqueInput
    });

    if (user) {
      return this.sanitizeOutput(user);
    } else {
      return null;
    }
  }

  async delete(where: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.delete({where});
  }

  setSshKey(sshKey: SetSshDto): string {
    // TODO: implement the public key handling
    return sshKey.publicKey;
  }
}