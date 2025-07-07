import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Flight } from 'generated/prisma';

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Flight, 'flightId'>) {
    //     if (user.role !== 'ADMIN') {
    //   throw new UnauthorizedException('You do not have permission to do this');
    // }

    try {
      return await this.prisma.flight.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Flight already exists');
      }
      throw new BadRequestException(error.message || 'Failed to create flight');
    }
  }

  async findAll() {
    try {
      return await this.prisma.flight.findMany({
        include: {
          aircraft: true,
          departureAirportRel: true,
          arrivalAirportRel: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch flights');
    }
  }

  async findOne(flightId: number) {
    const flight = await this.prisma.flight.findUnique({
      where: { flightId },
      include: { aircraft: true },
    });

    if (!flight) {
      throw new NotFoundException(`Flight with ID ${flightId} not found`);
    }

    return flight;
  }

  async update(flightId: number, data: Partial<Flight>) {
    try {
      await this.findOne(flightId);
      return await this.prisma.flight.update({
        where: { flightId },
        data,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to update flight');
    }
  }

  async delete(flightId: number) {
    try {
      // Kiểm tra tồn tại trước
      await this.findOne(flightId);

      return await this.prisma.flight.delete({ where: { flightId } });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete flight');
    }
  }
}
