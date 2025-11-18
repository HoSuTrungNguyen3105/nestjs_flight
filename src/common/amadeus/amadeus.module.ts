import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { AirportController } from './airport.controller';
import { AmadeusService } from './amadeus.service';
import { AirportImportService } from './airport-import.service';

@Module({
  imports: [PrismaModule],
  controllers: [AirportController],
  providers: [AirportImportService, AmadeusService],
  //   exports: [AmadeusService],
})
export class AmadeusModule {}
