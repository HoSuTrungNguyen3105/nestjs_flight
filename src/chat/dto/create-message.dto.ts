import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  senderId: number;

  @IsInt()
  receiverId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  content: string;
}
