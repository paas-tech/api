import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHealth(): Promise<boolean> {
    try {
      this.prismaService.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      return false;
    }
  }
}
