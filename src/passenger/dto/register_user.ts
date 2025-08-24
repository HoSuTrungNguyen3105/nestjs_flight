import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreatePassengerDto {
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  passport: string;
}

export class UpdatePassengerDto {
  fullName?: string;
  email?: string;
  phone?: string;
  passport?: string;
}
