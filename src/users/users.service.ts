import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { SetSshDto } from './dto/set-ssh.dto';
import { PrismaService } from 'src/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private passwd_encrypt(password: string) {
    // FIXME: implement encrypting passwords
    return password;
  }

  async create(user: CreateUserDto): Promise<User> {
    const timestamp: Date = new Date();

    const data: Prisma.UserCreateInput = {
      username: user.username,
      email: user.email,
      password: this.passwd_encrypt(user.password),
      isAdmin: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    return await this.prisma.user.create({data});
  }

  async findOne(userUniqueInput: Prisma.UserWhereUniqueInput): Promise<User|null> {
    return await this.prisma.user.findUnique({
      where: userUniqueInput
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.delete({where});
  }

  setSshKey(sshKey: SetSshDto): string {
    // TODO: implement the public key handling
    return sshKey.publicKey;
  }
}