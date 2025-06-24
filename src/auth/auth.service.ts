import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.service';
import { hash } from 'bcrypt';
import { User } from 'src/users/schemas/user.schema';
@Injectable()
export class AuthService {
  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
  constructor(private prisma: PrismaService) {}

  //   register = async (userData: RegisterDto):Promise<User> => {

  //     const user = await this.prisma.user.findUnique({
  //       where: { email: userData.email },
  //     });
  //     if (user) {
  //       throw new HttpException({message: 'User already exists'}, HttpStatus.BAD_REQUEST);
  //     }
  //     const hashedPassword = await hash(userData.password,10);

  //     const res = await this.prisma.user.create({
  //       data: {
  //         //id: userData.id,
  //         // Assuming the RegisterDto has these fields

  //         // firstName: userData.firstName,
  //         // lastName: userData.lastName,
  //        // email: userData.email,
  //         // phoneNumber: userData.phoneNumber,
  //         // dateOfBirth: userData.dateOfBirth,
  //          ...userData,
  //         name: `${userData.firstName} ${userData.lastName}`,
  //         // role: userData.role, // Assuming 'USER' is a valid role
  //         password: hashedPassword
  //   }})
  //         return res;
  //   // return this.authService.create(createAuthDto);
  // }
}
