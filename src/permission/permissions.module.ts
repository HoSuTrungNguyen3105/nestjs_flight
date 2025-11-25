import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PrismaModule } from 'src/prisma.module';
import { PermissionsService } from './permissions.service';

@Module({
  controllers: [PermissionsController],
  imports: [PrismaModule],
  // controllers: [FlightsController],
  providers: [PermissionsService],
})
export class PermissionsModule {}
