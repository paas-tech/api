import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { SetSshDto } from 'src/users/dto/set-ssh.dto';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma } from '@prisma/client';
import { SanitizedUser } from './types/sanitized-user.type';
import { exclude } from 'src/utils/prisma-exclude';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

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

  async validateEmailNonce(uuid: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: {
          emailNonce: uuid,
        },
        data: {
          emailNonce: null
        }
      })
      return true;
    } catch {
      return false;
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

  setSshKey(sshKey: SetSshDto): string {
    // TODO: implement the public key handling
    return sshKey.publicKey;
  }
}