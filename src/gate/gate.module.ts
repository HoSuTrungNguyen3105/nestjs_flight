import { Module } from '@nestjs/common';
import { GateController } from './gate.controller';
import { GatesService } from './gate.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GateController],
  providers: [GatesService],
  //   exports: [GatesService],
})
export class GatesModule {}
