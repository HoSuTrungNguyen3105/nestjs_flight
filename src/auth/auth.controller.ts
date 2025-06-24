import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'generated/prisma';
import { hash } from 'bcrypt';
import { Auth } from './entities/auth.entity';
@Controller('auth')
export class AuthController {
  constructor(private prismaService: PrismaService) {}

  // @Post('register')
  // register(@Body() createAuthDto: CreateAuthDto) {
  //   register = async (userData: RegisterDto):Promise<Auth> => {

  //     const user = await this.prismaService.user.findUnique({
  //       where: { email: userData.email },
  //     });
  //     if (user) {
  //       throw new HttpException({message: 'User already exists'}, HttpStatus.BAD_REQUEST);
  //     }
  //     const hashedPassword = await hash(userData.password,10);

  //     const res = await this.prismaService.user.create({
  //       data: {
  //         firstName: userData.firstName,
  //         lastName: userData.lastName,
  //         email: userData.email,
  //         phoneNumber: userData.phoneNumber,
  //         dateOfBirth: userData.dateOfBirth,
  //         // ...userData,
  //         name: `${userData.firstName} ${userData.lastName}`,
  //         // role: userData.role, // Assuming 'USER' is a valid role
  //         password: hashedPassword
  //   }})
  //           return res;

  //   // return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
