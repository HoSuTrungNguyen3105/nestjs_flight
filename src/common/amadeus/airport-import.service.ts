import { Injectable } from '@nestjs/common';
import { AmadeusService } from './amadeus.service';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma.service';
import { Flight } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import * as path from 'path';
import * as fs from 'fs';
import { nowDecimal } from '../helpers/format';
// import * as path from 'path';

@Injectable()
export class AirportImportService {
  constructor(
    private prisma: PrismaService,
    private amadeus: AmadeusService,
  ) {}

  async importAirports() {
    try {
      const data = await this.amadeus.fetchAllAirports();

      for (const a of data) {
        await this.prisma.airport.upsert({
          where: { code: a.iataCode },
          update: {},
          create: {
            code: a.iataCode,
            name: a.name,
            city: a.address.cityName,
            country: a.address.countryName,
            createdAt: new Decimal(Date.now() / 1000),
          },
        });
      }

      return { total: data };
    } catch (error) {
      console.error('err', error);
    }
  }

  //   async importAirportToFlight() {
  //     try {
  //       //   const filePath = path.join(__dirname, 'airports.json');
  //       //   const filePath = path.resolve(__dirname, 'airports.json'); // resolve thay vì join
  //       const filePath = path.join(
  //         process.cwd(),
  //         'src/common/amadeus/airports.json',
  //       );

  //       if (!fs.existsSync(filePath)) {
  //         throw new Error(`File not found: ${filePath}`);
  //       }
  //       const raw = fs.readFileSync(filePath, 'utf-8');
  //       const data = JSON.parse(raw);

  //       const timestamp = nowDecimal(); // dùng số nguyên cho Decimal

  //       for (const airport of data.total) {
  //         await this.prisma.airport.upsert({
  //           where: { code: airport.iataCode },
  //           update: {
  //             name: airport.name,
  //             city: airport.address.cityName,
  //             country: airport.address.countryName,
  //             updatedAt: timestamp,
  //           },
  //           create: {
  //             code: airport.iataCode,
  //             name: airport.name,
  //             city: airport.address.cityName,
  //             country: airport.address.countryName,
  //             createdAt: timestamp,
  //           },
  //         });
  //       }

  //       return {
  //         message: 'Imported airports successfully',
  //         count: data.total.length,
  //       };
  //     } catch (error) {
  //       console.error('err', error);
  //     }
  //   }

  async createRandomFlights(count: number = 10): Promise<BaseResponseDto> {
    const airports = await this.prisma.airport.findMany();
    const aircrafts = await this.prisma.aircraft.findMany();

    const flights: Flight[] = [];

    const toDecimal = (date: Date) =>
      new Decimal((date.getTime() / 1000).toFixed(3));

    const randomFlightNo = () => {
      const prefix = ['VN', 'VJ', 'QH', 'SQ', 'CX'][
        Math.floor(Math.random() * 5)
      ];
      return prefix + Math.floor(100 + Math.random() * 900);
    };

    for (let i = 0; i < count; i++) {
      let origin = airports[Math.floor(Math.random() * airports.length)];
      let destination = airports[Math.floor(Math.random() * airports.length)];

      while (destination.code === origin.code) {
        destination = airports[Math.floor(Math.random() * airports.length)];
      }

      const aircraft = aircrafts[Math.floor(Math.random() * aircrafts.length)];

      const departureTime = new Date(
        Date.now() + Math.random() * 20 * 24 * 3600 * 1000,
      );
      const arrivalTime = new Date(
        departureTime.getTime() + (1 + Math.random() * 6) * 3600 * 1000,
      );

      const flight = await this.prisma.flight.create({
        data: {
          flightNo: randomFlightNo(),
          departureAirport: origin.code,
          arrivalAirport: destination.code,
          aircraftCode: aircraft.code,
          scheduledDeparture: toDecimal(departureTime),
          scheduledArrival: toDecimal(arrivalTime),
          actualDeparture: null,
          actualArrival: null,
          priceEconomy: Number((50 + Math.random() * 300).toFixed(2)),
          priceBusiness: Number((200 + Math.random() * 500).toFixed(2)),
          priceFirst: Number((400 + Math.random() * 800).toFixed(2)),
          isDomestic: origin.country === destination.country,
        },
      });

      flights.push(flight);
    }

    return {
      resultCode: '00',
      resultMessage: 'Success',
    };
  }
}
