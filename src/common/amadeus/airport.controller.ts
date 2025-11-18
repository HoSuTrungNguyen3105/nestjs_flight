import { Controller, Get, Post } from '@nestjs/common';
import { AirportImportService } from './airport-import.service';

@Controller('sys/airport')
export class AirportController {
  constructor(private importer: AirportImportService) {}

  @Get('import')
  async importAirports() {
    return this.importer.importAirports();
  }

  //   @Post('import/batch')
  //   async import() {
  //     return this.importer.importAirportToFlight();
  //   }

  @Post('flight/random')
  async createRandom() {
    return this.importer.createRandomFlights(10);
  }
}
