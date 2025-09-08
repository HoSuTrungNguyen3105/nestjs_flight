import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserFromAdminDto } from './dto/update-user-from-admin.dto';
import { UpdateUserInfoDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/common/mfa/jwt-auth.guard';

@Controller('sys/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('getRandomPw')
  async getRandomPassword() {
    return this.userService.randomPw();
  }

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

  @Post('promoteRank')
  async setPromoteRank(@Body() dto: { userId: number }) {
    return this.userService.promoteRank(dto.userId);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Get('/getUserInfo/:id')
  async getUserInfo(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserInfo(id);
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

  @Post('approve-unlock-all')
  async approveUnlockAll() {
    return this.userService.approveAllUnlockRequests();
  }

  @Post('reject-unlock/:id')
  async rejectUnlock(@Param('id', ParseIntPipe) id: number) {
    return this.userService.rejectUnlockRequest(id);
  }

  @Post('updateUserFromAdmin')
  async updateUserFromAdmin(
    @Body() dto: UpdateUserFromAdminDto & { id: number },
  ) {
    return this.userService.updateUserFromAdmin(dto.id, dto);
  }
  // @UseGuards(JwtAuthGuard)
  @Post('updateUserInfo/:id')
  async updateUserInfo(
    @Body() dto: UpdateUserInfoDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.updateUserInfo(id, dto);
  }

  @Post('getUserIdByEmail')
  async getUserIdByEmail(@Body('email') email: string) {
    return this.userService.getUserIdByEmail(email);
  }

  @Post('deleteUser')
  async remove(@Body('id') id: number) {
    return this.userService.deleteUser(Number(id));
  }

  @Post('reject/:userId')
  async rejectTransfer(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.rejectTransfer(userId);
  }

  @Post('payroll/generate')
  async generatePayroll(
    @Body('employeeId') employeeId: number,
    @Body('month') month: number,
    @Body('year') year: number,
    @Body('baseSalary') baseSalary: number,
  ) {
    return this.userService.generatePayroll(
      employeeId,
      month,
      year,
      baseSalary,
    );
  }

  @Post('payroll/finalize/:id')
  async finalizePayroll(@Param('id') id: string) {
    return this.userService.finalizePayroll(Number(id));
  }

  @Post('attendance/check-in')
  async checkIn(@Body('employeeId') employeeId: number) {
    return this.userService.checkIn(employeeId);
  }

  @Post('attendance/check-out/:id')
  async checkOut(@Param('id') id: string) {
    return this.userService.checkOut(Number(id));
  }

  @Post('leave/apply')
  async applyLeave(
    @Body('employeeId') employeeId: number,
    @Body('leaveType') leaveType: string,
    @Body('start') start: string,
    @Body('end') end: string,
    @Body('reason') reason?: string,
  ) {
    return this.userService.applyLeave(
      employeeId,
      leaveType,
      new Date(start),
      new Date(end),
      reason,
    );
  }

  @Post('leave/approve/:id')
  async approveLeave(
    @Param('id') id: string,
    @Body('approverId') approverId: number,
    @Body('note') note?: string,
  ) {
    return this.userService.approveLeave(Number(id), approverId, note);
  }
}
