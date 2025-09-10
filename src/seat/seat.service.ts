import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { Prisma, Seat, SeatType } from 'generated/prisma';

@Injectable()
export class SeatService {
  constructor(private prisma: PrismaService) {}

  // async create(data: CreateSeatDto) {
  //   try {
  //     const flight = await this.prisma.flight.findUnique({
  //       where: { flightId: data.flightId },
  //     });

  //     if (!flight) {
  //       return { resultCode: '09', resultMessage: 'Flight not found.' };
  //     }

  //     if (data.column) {
  //       const seat = await this.prisma.seat.create({
  //         data: {
  //           row: data.row,
  //           column: data.column,
  //           flightId: data.flightId,
  //           isBooked: data.isBooked ?? false,
  //         },
  //       });
  //       return {
  //         resultCode: '00',
  //         resultMessage: 'Created 1 seat successfully',
  //         data: seat,
  //       };
  //     }

  //     const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  //     const seats = columns.map((col) => ({
  //       row: data.row,
  //       column: col,
  //       flightId: data.flightId,
  //       isBooked: false,
  //     }));

  //     const res = await this.prisma.seat.createMany({
  //       data: seats,
  //       skipDuplicates: true,
  //     });

  //     return {
  //       resultCode: '00',
  //       resultMessage: `Created ${res.count} seats successfully for row ${data.row}`,
  //     };
  //   } catch (err) {
  //     console.error('An error occurred during seat creation:', err);
  //     throw err;
  //   }
  // }

  // async create(data: CreateSeatDto) {
  //   try {
  //     const flight = await this.prisma.flight.findUnique({
  //       where: { flightId: data.flightId },
  //     });

  //     if (!flight) {
  //       return { resultCode: '09', resultMessage: 'Flight not found.' };
  //     }

  //     // Nếu chỉ truyền 1 column → tạo 1 seat
  //     if (data.column) {
  //       const seat = await this.prisma.seat.create({
  //         data: {
  //           row: data.row,
  //           column: data.column,
  //           flightId: data.flightId,
  //           isBooked: data.isBooked ?? false,
  //         },
  //       });
  //       return {
  //         resultCode: '00',
  //         resultMessage: 'Created 1 seat successfully',
  //         seat,
  //       };
  //     }

  //     // Nếu không truyền column → auto generate từ A đến F
  //     const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  //     const seats = columns.map((col) => ({
  //       row: data.row,
  //       column: col,
  //       flightId: data.flightId,
  //       isBooked: false,
  //     }));

  //     const res = await this.prisma.seat.createMany({
  //       data: seats,
  //       skipDuplicates: true,
  //     });

  //     return {
  //       resultCode: '00',
  //       resultMessage: `Created ${res.count} seats successfully for row ${data.row}`,
  //     };
  //   } catch (err) {
  //     console.error('An error occurred during seat creation:', err);
  //     throw err;
  //   }
  // }

  // async create(data: CreateSeatDto) {
  //   try {
  //     const flight = await this.prisma.flight.findUnique({
  //       where: { flightId: data.flightId },
  //     });

  //     if (!flight) {
  //       return { resultCode: '09', resultMessage: 'Flight not found.' };
  //     }

  //     // Trường hợp tạo 1 seat cụ thể
  //     if (data.seatRow && data.seatNumber) {
  //       const seat = await this.prisma.seat.create({
  //         data: {
  //           seatRow: data.seatRow, // Ví dụ: "A"
  //           seatNumber: data.seatNumber, // Ví dụ: 1
  //           flightId: data.flightId,
  //           isBooked: data.isBooked ?? false,
  //         },
  //       });

  //       return {
  //         resultCode: '00',
  //         resultMessage: 'Created 1 seat successfully',
  //         data: seat,
  //       };
  //     }

  //     // Nếu không truyền → mặc định tạo 6 ghế cho 1 row (ví dụ A1..A6)
  //     const seats = Array.from({ length: 6 }, (_, idx) => ({
  //       seatRow: data.seatRow ?? 'A', // mặc định row A nếu không truyền
  //       seatNumber: idx + 1, // 1 → 6
  //       flightId: data.flightId,
  //       isBooked: false,
  //     }));

  //     const res = await this.prisma.seat.createMany({
  //       data: seats,
  //       skipDuplicates: true,
  //     });

  //     return {
  //       resultCode: '00',
  //       resultMessage: `Created ${res.count} seats successfully for row ${data.seatRow ?? 'A'}`,
  //     };
  //   } catch (err) {
  //     console.error('An error occurred during seat creation:', err);
  //     throw err;
  //   }
  // }

  // async getSeatsByFlight(flightId: number) {
  //   return this.prisma.seat.findMany({
  //     where: { flightId },
  //     orderBy: [{ seatRow: 'asc' }, { : 'asc' }],
  //   });
  // }

  async create(data: CreateSeatDto) {
    try {
      const flight = await this.prisma.flight.findUnique({
        where: { flightId: data.flightId },
      });

      if (!flight) {
        return { resultCode: '09', resultMessage: 'Flight not found.' };
      }

      // Trường hợp tạo 1 seat cụ thể
      if (data.seatRow && data.seatNumber) {
        const seat = await this.prisma.seat.create({
          data: {
            seatRow: data.seatRow, // A-F
            seatNumber: data.seatNumber, // 1-40
            flightId: data.flightId,
            isBooked: data.isBooked ?? false,
          },
        });

        return {
          resultCode: '00',
          resultMessage: 'Created 1 seat successfully',
          data: seat,
        };
      }

      const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
      const seats: Prisma.SeatCreateManyInput[] = [];

      for (let row = 1; row <= 40; row++) {
        for (const col of columns) {
          seats.push({
            seatRow: col,
            seatNumber: row,
            flightId: data.flightId,
            isBooked: false,
          });
        }
      }

      const res = await this.prisma.seat.createMany({
        data: seats,
        skipDuplicates: true,
      });

      return {
        resultCode: '00',
        resultMessage: `Created ${res.count} seats successfully (A-F × 1-40).`,
      };
    } catch (err) {
      console.error('An error occurred during seat creation:', err);
      throw err;
    }
  }

  async deleteAllByFlight(flightId: number) {
    try {
      const res = await this.prisma.seat.deleteMany({
        where: { flightId },
      });

      return {
        resultCode: '00',
        resultMessage: `Deleted ${res.count} seats successfully for flightId ${flightId}`,
      };
    } catch (err) {
      console.error('Error deleting seats:', err);
      throw err;
    }
  }

  async deleteAllSeats() {
    try {
      const deleted = await this.prisma.seat.deleteMany({});
      return {
        resultCode: '00',
        resultMessage: `Deleted ${deleted.count} seats successfully`,
      };
    } catch (err) {
      console.error('Error deleting seats:', err);
      throw err;
    }
  }

  async findAll() {
    const res = await this.prisma.seat.findMany();
    return {
      resultCode: '00',
      resultMessage: `Success`,
      list: res,
    };
  }

  async findOne(id: number) {
    const seat = await this.prisma.seat.findUnique({ where: { id } });
    if (!seat) {
      return {
        resultCode: '01',
        resultMessage: `Seat with ID ${id} not found.`,
      };
    }
    return {
      resultCode: '00',
      resultMessage: 'Success',
      data: seat,
    };
  }

  // async update(id: number, data: UpdateSeatDto) {
  //   const seat = await this.prisma.seat.findUnique({ where: { id } });
  //   if (!seat) {
  //     return {
  //       resultCode: '01',
  //       resultMessage: `Seat with ID ${id} not found.`,
  //     };
  //   }
  //   return this.prisma.seat.update({ where: { id }, data });
  // }

  async updateSeat(seatId: number, data: { type?: SeatType }) {
    // isBooked?: boolean
    try {
      const seat = await this.prisma.seat.update({
        where: { id: seatId },
        data,
      });

      return {
        resultCode: '00',
        resultMessage: 'Seat updated successfully',
        data: seat,
      };
    } catch (err) {
      console.error('Error updating seat:', err);
      throw err;
    }
  }

  async remove(id: number) {
    const seat = await this.prisma.seat.findUnique({ where: { id } });
    if (!seat) {
      return {
        resultCode: '01',
        resultMessage: `Seat with ID ${id} not found.`,
      };
    }
    if (seat.isBooked) {
      return {
        resultCode: '02',
        resultMessage: 'Cannot delete a booked seat.',
      };
    }
    return this.prisma.seat.delete({ where: { id } });
  }
}
