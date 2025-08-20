import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('sys/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('getRandomPw')
  async getRandomPassword() {
    return this.userService.randomPw();
  }

  @Get()
  async getAll() {
    return this.userService.getAllUsers();
  }

  @Post('createUserByAdmin')
  async createUserByAdmin(@Body() dto: CreateUserDto) {
    return this.userService.createUserByAdmin(dto);
  }

  @Post('setAccountLock')
  async setAccountLockChange(@Body() dto: { id: number }) {
    return this.userService.setAccountLockChange(dto.id);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUserById(id);
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  @Get('/getUserInfo/:id')
  async getUserInfo(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUserInfo(id);
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  // Xoá tất cả user
  @Post('deleteAll')
  async deleteAll() {
    return this.userService.deleteAllUsers();
  }

  // Update user
  @Post('updateUser')
  async update(@Body() dto: UpdateUserDto & { id: number }) {
    return this.userService.updateUserById(dto.id, dto);
  }

  // Xoá user theo id
  @Post('deleteUser')
  async remove(@Body() dto: { id: number }) {
    return this.userService.delete(dto.id);
  }
}
