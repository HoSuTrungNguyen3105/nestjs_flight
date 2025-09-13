import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceResponseDto } from './dto/attendance-response.dto';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { nowDecimal } from 'src/common/helpers/format';
import { Prisma } from 'generated/prisma';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
  ): Promise<BaseResponseDto<AttendanceResponseDto>> {
    const currentTime = nowDecimal();

    // ✅ tính workedHours
    let workedHours: number | null = null;
    if (createAttendanceDto.checkOut) {
      const checkInNum = Number(createAttendanceDto.checkIn);
      const checkOutNum = Number(createAttendanceDto.checkOut);
      workedHours = parseFloat(
        ((checkOutNum - checkInNum) / (1000 * 60 * 60)).toFixed(3),
      );
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        employeeId: createAttendanceDto.employeeId,
        date: new Prisma.Decimal(createAttendanceDto.date),
        checkIn: new Prisma.Decimal(createAttendanceDto.checkIn),
        ...(createAttendanceDto.checkOut !== undefined && {
          checkOut: new Prisma.Decimal(createAttendanceDto.checkOut),
        }),

        workedHours,
        note: createAttendanceDto.note,
        createdAt: new Prisma.Decimal(currentTime),
      },
      include: {
        employee: { select: { id: true, name: true, employeeNo: true } },
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Attendance record created successfully',
      data: attendance,
    };
  }

  async findAll(): Promise<BaseResponseDto<AttendanceResponseDto>> {
    const attendances = await this.prisma.attendance.findMany({
      include: {
        employee: { select: { id: true, name: true, employeeNo: true } },
      },
      orderBy: { date: 'desc' },
    });

    return {
      resultCode: '00',
      resultMessage: 'Fetched attendance records successfully',
      list: attendances.map((a) => new AttendanceResponseDto(a)),
    };
  }

  async findOne(id: number): Promise<AttendanceResponseDto> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, name: true, employeeNo: true } },
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return new AttendanceResponseDto(attendance);
  }

  async update(
    id: number,
    updateAttendanceDto: any,
  ): Promise<AttendanceResponseDto> {
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: { id },
    });
    if (!existingAttendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    // ✅ tính workedHours
    let workedHours = existingAttendance.workedHours;
    if (updateAttendanceDto.checkOut !== undefined) {
      const checkInNum =
        updateAttendanceDto.checkIn !== undefined
          ? Number(updateAttendanceDto.checkIn)
          : Number(existingAttendance.checkIn);

      workedHours = parseFloat(
        (
          (Number(updateAttendanceDto.checkOut) - checkInNum) /
          (1000 * 60 * 60)
        ).toFixed(3),
      );
    }

    const attendance = await this.prisma.attendance.update({
      where: { id },
      data: {
        ...(updateAttendanceDto.date && {
          date: new Prisma.Decimal(updateAttendanceDto.date),
        }),
        ...(updateAttendanceDto.checkIn && {
          checkIn: new Prisma.Decimal(updateAttendanceDto.checkIn),
        }),
        ...(updateAttendanceDto.checkOut !== undefined && {
          checkOut:
            updateAttendanceDto.checkOut !== null
              ? new Prisma.Decimal(updateAttendanceDto.checkOut)
              : null,
        }),
        ...(updateAttendanceDto.note && { note: updateAttendanceDto.note }),
        workedHours,
      },
      include: {
        employee: { select: { id: true, name: true, employeeNo: true } },
      },
    });

    return new AttendanceResponseDto(attendance);
  }

  async remove(id: number): Promise<void> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    await this.prisma.attendance.delete({ where: { id } });
  }

  async findByEmployee(
    employeeId: number,
    month?: number,
    year?: number,
  ): Promise<AttendanceResponseDto[]> {
    let where: any = { employeeId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1).getTime();
      const endDate = new Date(year, month, 0).getTime();

      where.date = {
        gte: new Prisma.Decimal(startDate),
        lte: new Prisma.Decimal(endDate),
      };
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, employeeNo: true } },
      },
      orderBy: { date: 'desc' },
    });

    return attendances.map((a) => new AttendanceResponseDto(a));
  }

  async calculateMonthlyHours(
    employeeId: number,
    month: number,
    year: number,
  ): Promise<number> {
    const attendances = await this.findByEmployee(employeeId, month, year);

    return attendances.reduce((total, a) => total + (a.workedHours || 0), 0);
  }
}
