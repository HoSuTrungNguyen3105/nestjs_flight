import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { BatchUpdateEmployeeNoDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserFromAdminDto } from './dto/update-user-from-admin.dto';
import { CreateLeaveRequestDto } from './dto/leave-request.dto';
import { RequestChangeRoleDto } from './dto/request-change-role.dto';

@Controller('sys/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('getRandomPw')
  async getRandomPassword() {
    return this.userService.randomPw();
  }

  @Post('employee-no/batch')
  async batchUpdateEmployeeNo(@Body() dto: BatchUpdateEmployeeNoDto) {
    return this.userService.batchUpdateEmployeeNo(dto);
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

  @Post('permission-change-role')
  async permissionToChangeRole(
    @Body() dto: { id: number; employeeNo: string },
  ) {
    return this.userService.permissionToChangeRole(dto.id, dto.employeeNo);
  }

  @Post('promoteRank')
  async setPromoteRank(@Body() dto: { userId: number }) {
    return this.userService.promoteRank(dto.userId);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Get('getUserInfo/:id')
  async getUserInfo(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserInfo(id);
  }

  @Post('deleteAll')
  async deleteAll() {
    return this.userService.deleteAllUsers();
  }

  @Post('request-unlock')
  async requestUnlock(@Body() dto: { userId: number; reason: string }) {
    return this.userService.requestUnlock(dto.userId, dto.reason);
  }

  @Post('request-unlock/delete')
  async deleteRequestUnlockById(@Body() dto: { userId: number }) {
    return this.userService.deleteUnlockRequestById(dto.userId);
  }

  @Post('approve-unlock/:id')
  async approveUnlock(@Param('id', ParseIntPipe) id: number) {
    return this.userService.approveUnlockRequest(id);
  }

  @Post('approveTransfer/:id')
  async approveTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.userService.approveTransfer(id);
  }

  @Post('rejectTransfer/:userId')
  async rejectTransfer(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.rejectTransfer(userId);
  }

  @Get('view/all-transfer-requests')
  async findAllTransferRequests() {
    return this.userService.findAllTransferRequests();
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
  // @Post('updateUserInfo/:id')
  // async updateUserInfo(
  //   @Body() dto: UpdateUserInfoDto,
  //   @Param('id', ParseIntPipe) id: number,
  // ) {
  //   return this.userService.updateUserInfo(id, dto);
  // }

  @Post('request-change-role')
  async requestChangeRole(@Body() dto: RequestChangeRoleDto) {
    const res = await this.userService.requestChangeRole(dto);
    return res;
  }

  @Post('getUserIdByEmail')
  async getUserIdByEmail(@Body('email') email: string) {
    return this.userService.getUserIdByEmail(email);
  }

  @Post('leave-requests')
  async createLeaveRequest(@Body() body: CreateLeaveRequestDto) {
    return this.userService.createLeaveRequest(body);
  }

  @Get('leave-requests/all')
  async getAllLeaveRequest() {
    return this.userService.getAllLeaveRequests();
  }

  @Post('leave-requests/delete')
  async deleteLeaveRequestById(@Body('id') id: number) {
    return this.userService.deleteLeaveRequestById(id);
  }

  @Post('leave-requests/delete-all')
  async deleteAllLeaveRequest() {
    return this.userService.deleteAllLeaveRequests();
  }

  @Get('leave-requests/checkLeaveRequest')
  async checkEmployeeLeaveRequest(@Body('id') id: number) {
    return this.userService.checkEmployeeLeaveRequest(id);
  }

  @Post('deleteUser')
  async remove(@Body('id') id: number) {
    return this.userService.deleteUser(Number(id));
  }

  @Post('attendance/delete')
  async deleteAttendance(@Body('id') id: number) {
    return this.userService.deleteAttendance(Number(id));
  }

  @Post('attendance/check-in')
  async checkIn(@Body('employeeId') employeeId: number) {
    return this.userService.checkIn(employeeId);
  }

  @Post('leave-requests/approve/:id')
  async approveLeaveRequest(
    @Param('id') id: string,
    @Body('approverId') approverId: number,
    @Body('note') note?: string,
  ) {
    return this.userService.approveLeaveRequest(Number(id), approverId, note);
  }

  @Post('leave-requests/reject/:id')
  async rejectLeaveRequest(
    @Param('id') id: string,
    @Body('approverId') approverId: number,
    @Body('note') note?: string,
  ) {
    return this.userService.rejectLeaveRequest(Number(id), approverId, note);
  }

  @Post('attendance/check-out/:id')
  async checkOut(@Param('id', ParseIntPipe) id: number) {
    return this.userService.checkOut(id);
  }

  @Post('findUserFromMessage')
  async findUserFromMessage(
    @Body('email') email: string,
    @Body('id') id: number,
  ) {
    return this.userService.findUserFromMessage(email, id);
  }

  @Get('init/exportPayrollsToExcel')
  async exportPayrolls() {
    return this.userService.exportPayrollsToExcel();
  }

  @Get('init/exportFlightsToExcel')
  async exportFlights() {
    return this.userService.exportFlightsToExcel();
  }
}
