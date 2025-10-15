import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RequestChangeRoleDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  fromUserId: number;

  @IsString()
  @IsNotEmpty()
  //   toUserId: number;
  employeeNo: string;
}
