import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Flight } from 'generated/prisma';

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Omit<Flight, 'flightId'>) {
    return this.prisma.flight.create({ data });
  }

  findAll() {
    return this.prisma.flight.findMany({
      include: {
        aircraft: true,
        departureAirportRel: true,
        arrivalAirportRel: true,
      },
    });
  }

  findOne(flightId: number) {
    return this.prisma.flight.findUnique({
      where: { flightId },
      include: { aircraft: true },
    });
  }

  update(flightId: number, data: Partial<Flight>) {
    return this.prisma.flight.update({ where: { flightId }, data });
  }

  delete(flightId: number) {
    return this.prisma.flight.delete({ where: { flightId } });
  }
}
