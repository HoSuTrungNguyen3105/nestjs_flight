import { PayrollStatus, Prisma } from 'generated/prisma';

export class PayrollResponseDto {
  id: number;

  employeeId: number;

  month: number;

  year: number;

  baseSalary: number;

  allowances: number;

  deductions: number;

  tax: number;

  netPay: number;

  status: PayrollStatus;

  generatedAt: Prisma.Decimal;

  employee?: {
    id: number;
    name: string;
    email?: string;
    position?: string | null;
    department?: string | null;
  };
}
