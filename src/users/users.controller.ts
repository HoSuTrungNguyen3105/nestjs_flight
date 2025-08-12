import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AccountLockDto } from './dto/set-account-user';

@Controller('sys/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get('getRandomPw')
  async getRandomPassword() {
    const user = this.userService.randomPw();
    return user;
  }
  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // GET /users → lấy tất cả user
  @Get()
  async getAll() {
    return this.userService.getAllUsers();
  }

  @Post('createUserByAdmin')
  async createUserByAdmin(@Body() dto: CreateUserDto) {
    // console.log('Received payload:', dto); // ✅ in ra giá trị
    return this.userService.createUserByAdmin(dto);
  }

  @Post('setAccountLock')
  async setAccountLockChange(@Body() dto: { id: number }) {
    return this.userService.setAccountLockChange(dto.id);
  }

  // GET /users/:id → lấy user theo id
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUserById(id);
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }
  // @Get('getRandomPw')
  // async getRandomPassword() {
  //   const user = await this.userService.randomPw();
  //   // if (!user) throw new NotFoundException('User không tồn tại');
  //   return user;
  // }
  // @Get('getRandomPw')
  // async getRandomPassword() {
  //   console.log('>>> getRandomPw called'); // nếu không thấy log => lỗi xảy ra trước controller
  //   const user = await this.userService.randomPw();
  //   return user;
  // }

  // user.controller.ts
  @Delete('all')
  async deleteAll() {
    return this.userService.deleteAllUsers();
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserById(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.delete(+id);
  }
}
