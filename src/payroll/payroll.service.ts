import { Injectable } from '@nestjs/common';
import { CreatePayrollDto, FindPayrollWhere } from './dto/create-payroll.dto';
import { PrismaService } from 'src/prisma.service';
import { nowDecimal } from 'src/common/helpers/format';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { PayrollStatus } from 'generated/prisma';
import { PayrollResponseDto } from './dto/payroll-response.dto';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePayrollDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: data.employeeId },
      });

      if (!user) {
        return {
          resultCode: '99',
          resultMessage: `User with ID ${data.employeeId} not found`,
        };
      }

      const existingPayroll = await this.prisma.payroll.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: data.employeeId,
            month: data.month,
            year: data.year,
          },
        },
      });

      if (existingPayroll) {
        return {
          resultCode: '03',
          resultMessage: `Payroll already exists for employee ${data.employeeId} in ${data.month}/${data.year}`,
        };
      }

      const {
        baseSalary,
        allowances = 0,
        deductions = 0,
        tax = 0,
        ...rest
      } = data;

      const netPay = baseSalary + allowances - deductions - tax;

      const res = await this.prisma.payroll.create({
        data: {
          ...rest,
          baseSalary,
          allowances,
          deductions,
          tax,
          netPay: netPay,
          status: 'DRAFT',
          generatedAt: nowDecimal(),
        },
      });
      return {
        resultCode: '00',
        resultMessage: 'Create Success',
        data: res,
      };
    } catch (error) {
      console.error('error', error);
      throw error;
    }
  }

  async getUserIdAndNameToDropdown() {
    const currentYear = new Date().getFullYear();

    const users = await this.prisma.user.findMany({
      where: {
        NOT: {
          payrolls: {
            some: {
              year: currentYear,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const list = users.map((u) => ({ value: u.id, label: u.name }));

    return {
      resultCode: '00',
      resultMessage: 'Danh sách người dùng chưa tạo bảng lương năm nay!',
      list,
    };
  }

  async findByEmployee(
    employeeId: number,
    month?: number,
    year?: number,
  ): Promise<BaseResponseDto<PayrollResponseDto>> {
    const where: FindPayrollWhere = { employeeId };

    if (month) where.month = month;
    if (year) where.year = year;

    const payrolls = await this.prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeNo: true,
            position: true,
            department: true,
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    return {
      resultCode: '00',
      resultMessage: 'Fetched payroll records',
      list: payrolls,
    };
  }

  async getAllPayrolls() {
    try {
      const payrolls = await this.prisma.payroll.findMany({
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeNo: true,
              position: true,
              department: true,
            },
          },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });

      const formattedPayrolls = payrolls.map((payroll) => {
        const formattedData: any = { ...payroll };
        if (
          formattedData.generatedAt &&
          typeof formattedData.generatedAt === 'object' &&
          'toNumber' in formattedData.generatedAt
        ) {
          formattedData.generatedAt = formattedData.generatedAt.toNumber();
        }
        const decimalFields = [
          'baseSalary',
          'allowances',
          'deductions',
          'tax',
          'netPay',
        ];
        decimalFields.forEach((field) => {
          if (
            formattedData[field] &&
            typeof formattedData[field] === 'object' &&
            'toNumber' in formattedData[field]
          ) {
            formattedData[field] = formattedData[field].toNumber();
          }
        });

        return formattedData;
      });

      return {
        resultCode: '00',
        resultMessage: 'Thành công',
        list: formattedPayrolls,
      };
    } catch (error) {
      console.error('Error getting payrolls:', error);
      return {
        resultCode: '01',
        resultMessage: 'Lỗi khi lấy dữ liệu payroll',
      };
    }
  }

  async getPayrollById(id: number) {
    const findPayrollData = await this.prisma.payroll.findUnique({
      where: { id },
    });

    if (!findPayrollData) {
      return {
        resultCode: '01',
        resultMessage: 'Khong co dữ liệu payroll',
      };
    }

    const res = await this.prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeNo: true,
            email: true,
            name: true,
            position: true,
            department: true,
            payrolls: true,
            hireDate: true,
          },
        },
      },
    });
    return {
      resultCode: '01',
      resultMessage: 'Success dữ liệu payroll',
      data: res,
    };
  }

  async deletePayrollById(id: number) {
    const findPayrollData = await this.prisma.payroll.findUnique({
      where: { id },
    });

    if (!findPayrollData) {
      return {
        resultCode: '01',
        resultMessage: 'Khong co dữ liệu payroll',
      };
    }

    const res = await this.prisma.payroll.delete({
      where: { id },
      include: {
        employee: { select: { id: true } },
      },
    });
    return {
      resultCode: '01',
      resultMessage: 'Success dữ liệu payroll',
      data: res,
    };
  }

  async finalizePayroll(id: number) {
    return this.prisma.payroll.update({
      where: { id },
      data: { status: 'FINALIZED' },
    });
  }

  // async generatePayroll(
  //   employeeId: number,
  //   month: number,
  //   year: number,
  //   baseSalary: number,
  //   allowances = 0,
  //   deductions = 0,
  //   tax = 0,
  // ) {
  //   try {
  //     const netPay = baseSalary + allowances - deductions - tax;

  //     const payroll = await this.prisma.payroll.create({
  //       data: {
  //         employeeId,
  //         month,
  //         year,
  //         baseSalary,
  //         allowances,
  //         deductions,
  //         tax,
  //         netPay,
  //         status: 'DRAFT',
  //         generatedAt: nowDecimal(),
  //       },
  //       include: {
  //         employee: { select: { id: true, name: true, employeeNo: true } },
  //       },
  //     });

  //     return {
  //       resultCode: '00',
  //       resultMessage: 'Payroll generated successfully',
  //       data: payroll,
  //     };
  //   } catch (error) {
  //     console.error('error', error);
  //     throw error;
  //   }
  // }

  async getPayrollSummary() {
    const payrolls = await this.prisma.payroll.findMany({
      where: {
        status: PayrollStatus.FINALIZED,
      },
      include: {
        employee: {
          select: {
            department: true,
          },
        },
      },
    });

    const totalPayroll = payrolls.reduce(
      (sum, payroll) => sum + payroll.netPay,
      0,
    );
    const totalTax = payrolls.reduce((sum, payroll) => sum + payroll.tax, 0);

    const byDepartment = payrolls.reduce((acc, payroll) => {
      const dept = payroll.employee.department || 'Unknown';
      if (!acc[dept]) acc[dept] = 0;
      acc[dept] += payroll.netPay;
      return acc;
    }, {});

    return {
      resultCode: '00',
      resultMessage: 'Success',
      data: {
        totalPayroll,
        totalTax,
        averagePay: totalPayroll / payrolls.length,
        byDepartment,
        count: payrolls.length,
      },
    };
  }
}
