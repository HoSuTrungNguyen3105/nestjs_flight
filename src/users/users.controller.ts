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

  // ✅ API: Lấy tất cả request chuyển quyền admin
  @Get('requests')
  async findAllUserRequests() {
    return this.userService.findAllUserRequests();
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
    // if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  @Post('deleteAll')
  async deleteAll() {
    return this.userService.deleteAllUsers();
  }
  @Post('approveTransfer/:id')
  async approveTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.userService.approveTransfer(id);
  }

  @Post('request-unlock')
  async requestUnlock(@Body() dto: { userId: number; reason: string }) {
    return this.userService.requestUnlock(dto.userId, dto.reason);
  }

  @Post('approve-unlock/:id')
  async approveUnlock(@Param('id', ParseIntPipe) id: number) {
    return this.userService.approveUnlockRequest(id);
  }

  @Post('reject-unlock/:id')
  async rejectUnlock(@Param('id', ParseIntPipe) id: number) {
    return this.userService.rejectUnlockRequest(id);
  }

  @Get('unlock-requests')
  async getUnlockRequests() {
    return this.userService.getAllUnlockRequests();
  }

  @Post('updateUser')
  async update(@Body() dto: UpdateUserDto & { id: number }) {
    return this.userService.updateUserById(dto.id, dto);
  }

  @Post('deleteUser')
  async remove(@Body() dto: { id: number }) {
    return this.userService.delete(dto.id);
  }

  // ✅ API: Reject một request (dùng id)
  @Post('reject/:userId')
  async rejectTransfer(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.rejectTransfer(userId);
  }
}
