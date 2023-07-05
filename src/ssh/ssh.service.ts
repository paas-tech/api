import { Injectable } from '@nestjs/common';
import { SetSshDto } from './dto/set-ssh.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma, SshKey } from '@prisma/client';
import { exclude } from 'src/utils/prisma-exclude';
import { SanitizedSshKey } from './types/sanitized-ssh-key';
import { CreateSshKeyDto } from './dto/create-sshkey.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class SshService {
  constructor(
    private prisma: PrismaService, 
    private usersService: UsersService) {}


  private sanitizeOutput(sshKey: SshKey): SanitizedSshKey {
    return exclude(sshKey, ['id', 'userId', 'createdAt', 'updatedAt']);
  }

  async create(sshKey: CreateSshKeyDto): Promise<SanitizedSshKey> {
    return this.sanitizeOutput(await this.prisma.sshKey.create({
      data: {
        value: sshKey.value,
        userId: sshKey.userId
      }
    }));
  }

  async findOne(sshKeyUniqueInput: Prisma.SshKeyWhereUniqueInput): Promise<SanitizedSshKey|null> {
    const sshKey = await this.prisma.sshKey.findUnique({
      where: sshKeyUniqueInput
    });

    if (sshKey) {
      return this.sanitizeOutput(sshKey);
    } else {
      return null;
    }
  }

  async findOneUnsanitized(sshKeyUniqueInput: Prisma.SshKeyWhereUniqueInput): Promise<SshKey|null> {
    return await this.prisma.sshKey.findUnique({
      where: sshKeyUniqueInput
    });
  }

  async delete(where: Prisma.SshKeyWhereUniqueInput) {
    return await this.prisma.sshKey.delete({where});
  }

  async setSshKey(sshKey: SetSshDto, username: string): Promise<boolean> {
    let user = await this.usersService.findOneUnsanitized({username});
    let createSshKeyDto: CreateSshKeyDto = {
        value: sshKey.publicKey,
        userId: user.id
    }
    if (!await this.create(createSshKeyDto)) {
        return false;
    }
    return true;
  }


  async removeSshKey(sshKey: SetSshDto, username: string): Promise<boolean> {
    try {
        let user = await this.usersService.findOneUnsanitized({username});
        if (!user) {
            return false;
        }
        let count = await this.prisma.sshKey.deleteMany({
            where: {
                value: sshKey.publicKey,
                userId: user.id
            }
        })
        if (count && count.count == 0) {
          return false;
        }
        return true; 
    } catch(err) {
        return false;
    }
  }


  async getAllSshKeys(username: string): Promise<SanitizedSshKey[]> {
    let user = await this.usersService.findOneUnsanitized({username})
    let sshKeys = await this.prisma.sshKey.findMany({
      where: {
        userId: user.id
      }
    })
    sshKeys.forEach(function(key, index) {
      sshKeys[index] = this.sanitizeOutput(key)
    }, this);
    return sshKeys;
  }


}