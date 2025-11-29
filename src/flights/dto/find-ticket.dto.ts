import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FindTicketDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  ticketNo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;
}
