import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';

@Module({
  imports: [PrismaModule],
  controllers: [HotelController],
  providers: [HotelService],
  //   exports: [GatesService],
})
export class HotelsModule {}
