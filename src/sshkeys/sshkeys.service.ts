import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, SshKey } from '@prisma/client';
import { exclude } from 'src/utils/prisma-exclude';
import { SanitizedSshKey } from './types/sanitized-ssh-key';
import { CreateSshKeyDto } from './dto/create-sshkey.dto';

@Injectable()
export class SshKeysService {
  constructor(
    private prisma: PrismaService,
  ) {}


  private sanitizeOutput(sshKey: SshKey): SanitizedSshKey {
    // all fields seem to be okay to return because SSH keys can only
    // be consulted by either their owner or the administrators
    // still, we leave the method in case it is needed later
    return exclude(sshKey, []);
  }

  async createSshKey(userId: string, sshKey: CreateSshKeyDto): Promise<SanitizedSshKey> {
    return this.sanitizeOutput(await this.prisma.sshKey.create({
      data: {
        value: sshKey.value,
        name: sshKey.name,
        userId,
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


  async removeSshKey(userId: string, sshKeyUuid: string): Promise<boolean> {
    try {
        const result = await this.prisma.sshKey.deleteMany({
          where: {
            id: sshKeyUuid,
            userId,
          }
        })
        return result.count > 0;
    } catch(err) {
        return false;
    }
  }


  async getSshKeysOfUser(userId: string): Promise<SanitizedSshKey[]> {
    const sshKeys = await this.prisma.sshKey.findMany({
      where: {
        userId
      }
    });
    return sshKeys.map(this.sanitizeOutput);
  }

  async getAllSshKeys(): Promise<SanitizedSshKey[]> {
    return (await this.prisma.sshKey.findMany()).map(this.sanitizeOutput);
  }


}