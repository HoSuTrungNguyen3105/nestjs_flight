// prisma.service.ts
import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
// import { PrismaClient } from 'generated/prisma';
import { PrismaClient } from '../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  //   async enableShutdownHooks(app: INestApplication) {
  //    this.$on('beforeExit' as Prisma.PrismaEvent, async () => {
  //   await app.close();
  // });
  // }
}
