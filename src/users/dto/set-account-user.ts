import { IsNumber, IsIn } from 'class-validator';

export class AccountLockDto {
  @IsNumber()
  id: number;

  @IsIn(['Y', 'N'])
  accountLockYn: string;
}
