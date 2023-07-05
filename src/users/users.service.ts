import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma, SshKey } from '@prisma/client';
import { SanitizedUser } from './types/sanitized-user.type';
import { exclude } from 'src/utils/prisma-exclude';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  public sanitizeOutput(user: User): SanitizedUser {
    return exclude(user, ['id', 'emailNonce', 'passwordNonce', 'password', 'createdAt', 'updatedAt']);
  }

  private async passwd_encrypt(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async create(user: CreateUserDto): Promise<User> {
    return await this.prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: await this.passwd_encrypt(user.password),
        isAdmin: false
      }
    });
  }

  async validateEmail(email: string): Promise<boolean> {
    // Check that email address doesn't already exist in the db
    return !await this.findOne({ email });
  }

  async validateEmailNonce(email_nonce: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: {
          emailNonce: email_nonce,
        },
        data: {
          emailNonce: null
        }
      })
      return true;
    } catch (err) {
      return false;
    }

  }


  async updatePassword(id: string, password: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: {
          id: id
        },
        data: {
          passwordNonce: null,
          password: await this.passwd_encrypt(password)
        }
      })
      return true;
    } catch (err) {
      return false;
    }

  }

  async regeneratePasswordNonce(id: string): Promise<string> {
    try {
      let passwordNonce = uuidv4()
      await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          passwordNonce: passwordNonce
        }
      })
      return passwordNonce;
    } catch (err) {
      return null;
    }
  }


  async validateUsername(username: string): Promise<boolean> {
    // Check that username doesn't already exist
    return !await this.findOne({ username });
  }

  async findOne(userUniqueInput: Prisma.UserWhereUniqueInput): Promise<SanitizedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: userUniqueInput
    });

    if (user) {
      return this.sanitizeOutput(user);
    } else {
      return null;
    }
  }

  async findOneUnsanitized(userUniqueInput: Prisma.UserWhereUniqueInput): Promise<User|null> {
    return await this.prisma.user.findUnique({
      where: userUniqueInput
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.delete({ where });
  }


}