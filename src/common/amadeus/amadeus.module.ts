import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { AirportController } from './airport.controller';
import { AmadeusService } from './amadeus.service';

@Module({
  imports: [PrismaModule],
  providers: [AmadeusService],
  controllers: [AirportController],
  exports: [AmadeusService],
})
export class AmadeusModule {}
