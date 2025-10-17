import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateGateDto,
  GateQueryDto,
  UpdateGateDto,
} from './dto/create.gate.dto';
import {
  CreateGateAssignmentDto,
  UpdateGateAssignmentDto,
} from './dto/create-gate-assignment.dto';
import { nowDecimal } from 'src/common/helpers/format';

@Injectable()
export class GatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findTerminalID() {
    const terminals = await this.prisma.terminal.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
      },
    });

    const list = (terminals ?? []).map((t) => ({
      value: t.id,
      label: t.code,
    }));

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách terminal thành công!',
      list,
    };
  }

  async create(createGateDto: CreateGateDto) {
    const terminal = await this.prisma.terminal.findUnique({
      where: { id: createGateDto.terminalId },
    });

    if (!terminal) {
      return {
        resultCode: '01',
        resultMessage: `Terminal with id ${createGateDto.terminalId} not found`,
        data: terminal,
      };
    }

    const existingGate = await this.prisma.gate.findFirst({
      where: {
        terminalId: createGateDto.terminalId,
        code: createGateDto.code,
      },
    });

    if (existingGate) {
      return {
        resultCode: '01',
        resultMessage: `Gate with code ${createGateDto.code} already exists in terminal ${createGateDto.terminalId}`,
      };
    }
    await this.prisma.gate.create({
      data: {
        ...createGateDto,
        status: createGateDto.status || 'AVAILABLE',
        createdAt: nowDecimal(),
        updatedAt: nowDecimal(),
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Success create gate',
    };
  }

  async createMany(createGateDtos: CreateGateDto[]) {
    if (!createGateDtos || createGateDtos.length === 0) {
      return {
        resultCode: '01',
        resultMessage: 'No gate data provided',
        data: [],
      };
    }

    // Lấy danh sách terminalId duy nhất để kiểm tra trước
    const terminalIds = [...new Set(createGateDtos.map((g) => g.terminalId))];

    // Kiểm tra terminal có tồn tại không
    const terminals = await this.prisma.terminal.findMany({
      where: { id: { in: terminalIds } },
    });

    const existingTerminalIds = terminals.map((t) => t.id);
    const invalidTerminals = terminalIds.filter(
      (id) => !existingTerminalIds.includes(id),
    );

    if (invalidTerminals.length > 0) {
      return {
        resultCode: '01',
        resultMessage: `Terminals not found: ${invalidTerminals.join(', ')}`,
      };
    }

    // Kiểm tra trùng code trong cùng terminal
    const duplicates = await Promise.all(
      createGateDtos.map((dto) =>
        this.prisma.gate.findFirst({
          where: {
            terminalId: dto.terminalId,
            code: dto.code,
          },
        }),
      ),
    );

    const foundDuplicates = duplicates.filter(Boolean);
    if (foundDuplicates.length > 0) {
      const duplicateCodes = foundDuplicates.map((g) => g?.code).join(', ');
      return {
        resultCode: '01',
        resultMessage: `Some gates already exist: ${duplicateCodes}`,
      };
    }

    // Tạo mới tất cả gate
    const createdGates = await this.prisma.$transaction(
      createGateDtos.map((dto) =>
        this.prisma.gate.create({
          data: {
            ...dto,
            status: dto.status || 'AVAILABLE',
            createdAt: nowDecimal(),
            updatedAt: nowDecimal(),
          },
        }),
      ),
    );

    return {
      resultCode: '00',
      resultMessage: `${createdGates.length} gates created successfully`,
      data: createdGates,
    };
  }

  async findAllGate(query: GateQueryDto) {
    const { status, terminalId, search, page, limit } = query;
    if (!page || !limit) {
      return;
    }
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (terminalId) {
      where.terminalId = terminalId;
    }

    if (search) {
      where.OR = [{ code: { contains: search, mode: 'insensitive' } }];
    }

    const [gates, total] = await Promise.all([
      this.prisma.gate.findMany({
        where,
        skip,
        take: limit,
        include: {
          terminal: true,
          assignments: {
            include: {
              flight: true,
            },
            orderBy: { assignedAt: 'desc' },
          },
        },
        orderBy: { code: 'asc' },
      }),
      this.prisma.gate.count({ where }),
    ]);

    return {
      data: gates,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // async findTerminalID() {
  //   const terminals = await this.prisma.terminal.findMany({
  //     orderBy: { createdAt: 'desc' },
  //     select: {
  //       id: true,
  //       code: true,
  //     },
  //   });

  //   const list = terminals.map((t) => ({
  //     value: t.id,
  //     label: t.code,
  //   }));

  //   console.log('res', list);

  //   return {
  //     resultCode: '00',
  //     resultMessage: 'Lấy danh sách terminal thành công!',
  //     list,
  //   };
  // }

  async findGateByID(id: string) {
    const gate = await this.prisma.gate.findUnique({
      where: { id },
      include: {
        terminal: true,
        assignments: {
          include: {
            flight: true,
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!gate) {
      //   throw new NotFoundException(`Gate with id ${id} not found`);
    }

    return gate;
  }

  async updateGateById(id: string, updateGateDto: UpdateGateDto) {
    try {
      const gate = await this.prisma.gate.findUnique({ where: { id } });

      if (!gate) {
        return {
          resultCode: '00',
          resultMessage: `Gate with id ${id} not found`,
        };
      }
      await this.prisma.gate.update({
        where: { id },
        data: {
          ...updateGateDto,
          updatedAt: nowDecimal(),
        },
        include: {
          terminal: true,
          assignments: {
            include: {
              flight: true,
            },
            orderBy: { assignedAt: 'desc' },
          },
        },
      });
      return {
        resultCode: '00',
        resultMessage: 'Success update gate',
      };
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async findAllDataGate() {
    try {
      const res = await this.prisma.gate.findMany();
      return {
        resultCode: '00',
        resultMessage: 'Success create gate',
        list: res,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllGateCode() {
    try {
      const res = await this.prisma.gate.findMany({
        select: {
          code: true,
        },
      });
      return {
        resultCode: '00',
        resultMessage: 'Success create gate',
        list: res,
      };
    } catch (error) {
      throw error;
    }
  }

  async removeGateById(id: string) {
    try {
      return await this.prisma.gate.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  async removeAllGate() {
    try {
      await this.prisma.gate.deleteMany({});
      return {
        resultCode: '00',
        resultMessage: 'Success delete all gate',
      };
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async findByTerminalId(terminalId: string) {
    const terminal = await this.prisma.terminal.findUnique({
      where: { id: terminalId },
    });

    if (!terminal) {
      //   throw new NotFoundException(`Terminal with id ${terminalId} not found`);
    }

    return this.prisma.gate.findMany({
      where: { terminalId },
      include: {
        assignments: {
          include: {
            flight: true,
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async updateStatus(id: string, status: string) {
    try {
      return await this.prisma.gate.update({
        where: { id },
        data: {
          status: status as any,
          updatedAt: nowDecimal(),
        },
      });
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async createGateAssignment(createGateAssignmentDto: CreateGateAssignmentDto) {
    const gate = await this.prisma.gate.findUnique({
      where: { id: createGateAssignmentDto.gateId },
    });

    if (!gate) {
      return {
        resultCode: '01',
        resultMessage: `Gate with id ${createGateAssignmentDto.gateId} not found`,
      };
    }

    // Check if flight exists
    const flight = await this.prisma.flight.findUnique({
      where: { flightId: createGateAssignmentDto.flightId },
    });

    if (!flight) {
      return {
        resultCode: '01',
        resultMessage: `Flight with id ${createGateAssignmentDto.flightId} not found`,
      };
    }

    const existingAssignment = await this.prisma.gateAssignment.findFirst({
      where: {
        gateId: createGateAssignmentDto.gateId,
        flightId: createGateAssignmentDto.flightId,
      },
    });

    if (existingAssignment) {
      return {
        resultCode: '01',
        resultMessage: `Gate assignment already exists for gate ${createGateAssignmentDto.gateId} and flight ${createGateAssignmentDto.flightId}`,
      };
    }

    if (gate.status !== 'AVAILABLE') {
      return {
        resultCode: '01',
        resultMessage: `Gate ${gate.code} is not available. Current status: ${gate.status}`,
      };
    }

    const assignment = await this.prisma.gateAssignment.create({
      data: {
        ...createGateAssignmentDto,
        assignedAt: nowDecimal(),
        createdAt: nowDecimal(),
        updatedAt: nowDecimal(),
        releasedAt: nowDecimal(),
      },
      include: {
        gate: true,
        flight: true,
      },
    });

    // Update gate status to OCCUPIED
    await this.prisma.gate.update({
      where: { id: createGateAssignmentDto.gateId },
      data: {
        status: 'OCCUPIED',
        updatedAt: nowDecimal(),
      },
    });

    return {
      resultCode: '00',
      data: assignment,
    };
  }

  async findGateAssignmentById(id: string) {
    const assignment = await this.prisma.gateAssignment.findUnique({
      where: { id },
      include: {
        gate: true,
        flight: {
          select: {
            flightNo: true,
            departureAirport: true,
            arrivalAirport: true,
            aircraft: true,
            flightStatuses: true,
            status: true,
          },
        },
      },
    });

    if (!assignment) {
      return {
        resultCode: '01',
        resultMessage: `Gate assignment with id ${id} not found`,
      };
    }

    return {
      resultCode: '00',
      resultMessage: `Gate assignment with id ${id} has found`,
      data: assignment,
    };
  }

  async update(id: string, updateGateAssignmentDto: UpdateGateAssignmentDto) {
    try {
      return await this.prisma.gateAssignment.update({
        where: { id },
        data: {
          ...updateGateAssignmentDto,
          updatedAt: nowDecimal(),
        },
        include: {
          gate: true,
          flight: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const assignment = await this.prisma.gateAssignment.findUnique({
        where: { id },
        include: { gate: true },
      });

      if (!assignment) {
        return;
        // throw new NotFoundException(`Gate assignment with id ${id} not found`);
      }

      // Delete the assignment
      const result = await this.prisma.gateAssignment.delete({
        where: { id },
      });

      // Update gate status back to AVAILABLE if no other assignments
      const otherAssignments = await this.prisma.gateAssignment.count({
        where: { gateId: assignment.gateId },
      });

      if (otherAssignments === 0) {
        await this.prisma.gate.update({
          where: { id: assignment.gateId },
          data: {
            status: 'AVAILABLE',
            updatedAt: new Date().getTime(),
          },
        });
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async releaseAssignment(id: string) {
    try {
      const assignment = await this.prisma.gateAssignment.findUnique({
        where: { id },
        include: { gate: true },
      });

      if (!assignment) {
        return;
      }

      const updatedAssignment = await this.prisma.gateAssignment.update({
        where: { id },
        data: {
          releasedAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        },
        include: {
          gate: true,
          flight: true,
        },
      });

      // Update gate status back to AVAILABLE
      await this.prisma.gate.update({
        where: { id: assignment.gateId },
        data: {
          status: 'AVAILABLE',
          updatedAt: new Date().getTime(),
        },
      });

      return updatedAssignment;
    } catch (error) {
      throw error;
    }
  }

  async findByGateId(gateId: string) {
    const gate = await this.prisma.gate.findUnique({
      where: { id: gateId },
    });

    if (!gate) {
      return;
    }

    return this.prisma.gateAssignment.findMany({
      where: { gateId },
      include: {
        flight: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async findByFlightId(flightId: number) {
    const flight = await this.prisma.flight.findUnique({
      where: { flightId },
    });

    if (!flight) {
      return;
      //   throw new NotFoundException(`Flight with id ${flightId} not found`);
    }

    return this.prisma.gateAssignment.findMany({
      where: { flightId },
      include: {
        gate: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
  }
}
