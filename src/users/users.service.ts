import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { SetSshDto } from './dto/set-ssh.dto';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma } from '@prisma/client';
import { SanitizedUser } from './types/sanitized-user.type';
import { exclude } from 'src/utils/prisma-exclude';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private passwd_encrypt(password: string) {
    // FIXME: implement encrypting passwords
    return password;
  }

  private sanitizeOutput(user: User): SanitizedUser {
    return exclude(user, ['id', 'email_nonce', 'password', 'createdAt', 'updatedAt']);
  }

  async create(user: CreateUserDto): Promise<SanitizedUser> {
    const timestamp: Date = new Date();
    
    return this.sanitizeOutput(await this.prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: this.passwd_encrypt(user.password),
        isAdmin: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
    }));
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