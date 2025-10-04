import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';

@Controller('sys/payrolls')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('generate')
  async create(@Body() dto: CreatePayrollDto) {
    return this.payrollService.create(dto);
  }

  @Get('payroll/getById/:id')
  async getPayrollsById(@Param('id') id: string) {
    return this.payrollService.getPayrollById(Number(id));
  }

  @Get('getUserIdAndNameToDropdown')
  async getUserIdAndName() {
    return this.payrollService.getUserIdAndNameToDropdown();
  }

  @Get()
  async getPayrolls() {
    return this.payrollService.getAllPayrolls();
  }

  // @Get('payroll/getById/:id')
  // async getPayrollsById(@Param('id') id: number) {
  //   return this.payrollService.getPayrollById(id);
  // }

  @Get('payroll/summary')
  async getSummary() {
    return this.payrollService.getPayrollSummary();
  }

  // @Post('payroll/generate')
  // async generate(
  //   @Body('employeeId') employeeId: number,
  //   @Body('month') month: number,
  //   @Body('year') year: number,
  //   @Body('baseSalary') baseSalary: number,
  //   @Body('allowances') allowances?: number,
  //   @Body('deductions') deductions?: number,
  //   @Body('tax') tax?: number,
  // ) {
  //   return this.payrollService.generatePayroll(
  //     employeeId,
  //     month,
  //     year,
  //     baseSalary,
  //     allowances,
  //     deductions,
  //     tax,
  //   );
  // }

  @Post('payroll/finalize/:id')
  async finalize(@Param('id') id: number) {
    return this.payrollService.finalizePayroll(Number(id));
  }
  @Get('employee/:employeeId')
  async findByEmployee(
    @Param('employeeId') employeeId: number,
    @Body('month') month?: number,
    @Body('year') year?: number,
  ) {
    return this.payrollService.findByEmployee(Number(employeeId), month, year);
  }
}
