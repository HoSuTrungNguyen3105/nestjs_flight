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

  async create(createGateDto: CreateGateDto) {
    // Check if terminal exists
    const terminal = await this.prisma.terminal.findUnique({
      where: { id: createGateDto.terminalId },
    });

    if (!terminal) {
      return;
      //throw new NotFoundException(`Terminal with id ${createGateDto.terminalId} not found`);
    }

    // Check if gate code already exists for this terminal
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
      //   throw new ConflictException(`Gate with code ${createGateDto.code} already exists in terminal ${createGateDto.terminalId}`);
    }

    return this.prisma.gate.create({
      data: {
        ...createGateDto,
        status: createGateDto.status || 'AVAILABLE',
        createdAt: createGateDto.createdAt || new Date().getTime(),
        updatedAt: createGateDto.updatedAt || new Date().getTime(),
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
      return await this.prisma.gate.update({
        where: { id },
        data: {
          ...updateGateDto,
          updatedAt: updateGateDto.updatedAt || new Date().getTime(),
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
          updatedAt: new Date().getTime(),
        },
      });
    } catch (error) {
      throw error;
      //   throw new NotFoundException(`Gate with id ${id} not found`);
    }
  }

  async createGateAssignment(createGateAssignmentDto: CreateGateAssignmentDto) {
    // Check if gate exists
    const gate = await this.prisma.gate.findUnique({
      where: { id: createGateAssignmentDto.gateId },
    });

    if (!gate) {
      return;
      //   throw new NotFoundException(`Gate with id ${createGateAssignmentDto.gateId} not found`);
    }

    // Check if flight exists
    const flight = await this.prisma.flight.findUnique({
      where: { flightId: createGateAssignmentDto.flightId },
    });

    if (!flight) {
      //   throw new NotFoundException(`Flight with id ${createGateAssignmentDto.flightId} not found`);
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.gateAssignment.findFirst({
      where: {
        gateId: createGateAssignmentDto.gateId,
        flightId: createGateAssignmentDto.flightId,
      },
    });

    if (existingAssignment) {
      //   throw new ConflictException(`Gate assignment already exists for gate ${createGateAssignmentDto.gateId} and flight ${createGateAssignmentDto.flightId}`);
    }

    // Check if gate is available
    if (gate.status !== 'AVAILABLE') {
      //   throw new ConflictException(`Gate ${gate.code} is not available. Current status: ${gate.status}`);
    }

    const assignment = await this.prisma.gateAssignment.create({
      data: {
        ...createGateAssignmentDto,
        assignedAt: createGateAssignmentDto.assignedAt || nowDecimal(),
        createdAt: createGateAssignmentDto.createdAt || nowDecimal(),
        updatedAt: createGateAssignmentDto.updatedAt || nowDecimal(),
        releasedAt: createGateAssignmentDto.updatedAt || nowDecimal(),
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
        updatedAt: new Date().getTime(),
      },
    });

    return assignment;
  }

  async findGateAssignmentById(id: string) {
    const assignment = await this.prisma.gateAssignment.findUnique({
      where: { id },
      include: {
        gate: true,
        flight: true,
      },
    });

    if (!assignment) {
      return;
      //   throw new NotFoundException(`Gate assignment with id ${id} not found`);
    }

    return assignment;
  }

  async update(id: string, updateGateAssignmentDto: UpdateGateAssignmentDto) {
    try {
      return await this.prisma.gateAssignment.update({
        where: { id },
        data: {
          ...updateGateAssignmentDto,
          updatedAt: updateGateAssignmentDto.updatedAt || new Date().getTime(),
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
