import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { GatesService } from './gate.service';
import {
  CreateGateDto,
  GateQueryDto,
  UpdateGateDto,
} from './dto/create.gate.dto';
import {
  CreateGateAssignmentDto,
  UpdateGateAssignmentDto,
} from './dto/create-gate-assignment.dto';

@Controller('sys/gates')
export class GateController {
  constructor(private readonly gatesService: GatesService) {}

  @Post()
  create(@Body() createGateDto: CreateGateDto) {
    return this.gatesService.create(createGateDto);
  }

  @Get('findTerminalID')
  findTerminalID() {
    return this.gatesService.findTerminalID();
  }

  @Get()
  findAll(@Query() query: GateQueryDto) {
    return this.gatesService.findAllGate(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gatesService.findGateByID(id);
  }

  @Get('terminal/:terminalId')
  findByTerminalId(@Param('terminalId') terminalId: string) {
    return this.gatesService.findByTerminalId(terminalId);
  }

  @Post('update/:id')
  update(@Param('id') id: string, @Body() updateGateDto: UpdateGateDto) {
    return this.gatesService.updateGateById(id, updateGateDto);
  }

  @Post(':id/updateStatus/:status')
  updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.gatesService.updateStatus(id, status);
  }

  @Post('removeGateById/:id')
  remove(@Param('id') id: string) {
    return this.gatesService.removeGateById(id);
  }

  @Post('createGateAssignment')
  createGateAssignment(
    @Body() createGateAssignmentDto: CreateGateAssignmentDto,
  ) {
    return this.gatesService.createGateAssignment(createGateAssignmentDto);
  }

  @Get('findGateAssignmentById/:id')
  findGateAssignmentById(@Param('id') id: string) {
    return this.gatesService.findGateAssignmentById(id);
  }

  @Get('flight/:flightId')
  findByFlightId(@Param('flightId') flightId: number) {
    return this.gatesService.findByFlightId(flightId);
  }

  @Post('updateGateAssignment/:id')
  updateGateAssignment(
    @Param('id') id: string,
    @Body() updateGateAssignmentDto: UpdateGateAssignmentDto,
  ) {
    return this.gatesService.update(id, updateGateAssignmentDto);
  }

  @Post(':id/releaseAssignment')
  releaseAssignment(@Param('id') id: string) {
    return this.gatesService.releaseAssignment(id);
  }

  // @Post('findAllTerminal')
  // findAllTerminal() {
  //   return this.gatesService.findAllTerminal();
  // }

  @Post('removeGateAssignment/:id')
  removeGateAssignment(@Param('id') id: string) {
    return this.gatesService.remove(id);
  }
}
