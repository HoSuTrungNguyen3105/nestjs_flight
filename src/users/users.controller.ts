import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Res,
  Headers,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { BatchUpdateEmployeeNoDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserFromAdminDto } from './dto/update-user-from-admin.dto';
import { CreateLeaveRequestDto } from './dto/leave-request.dto';
import { RequestChangeRoleDto } from './dto/request-change-role.dto';
import { UpdateMyInfoDto } from './dto/update-my-info.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';

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

  // @Get('getUserInfo/:id')
  // async getUserInfo(@Param('id', ParseIntPipe) id: number) {
  //   return this.userService.getUserInfo(id);
  // }

  @Post('get-user-info')
  findPassengerById(@Body('id') id: number) {
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
  async deleteRequestUnlockById(@Body() dto: { id: number }) {
    return this.userService.deleteUnlockRequestById(dto.id);
  }

  @Post('approve-unlock')
  async approveUnlock(@Body('id', ParseIntPipe) requestId: number) {
    return this.userService.approveUnlockRequest(requestId);
  }

  @Post('reject-unlock')
  async rejectUnlock(@Body('id', ParseIntPipe) requestId: number) {
    return this.userService.rejectUnlockRequest(requestId);
  }

  @Get('my_request-unlock/:id')
  async getMyUnlockRequest(@Param('id', ParseIntPipe) requestId: number) {
    return this.userService.getMyUnlockRequests(requestId);
  }

  @Post('modeTransfer')
  async modeTransferOption(
    @Body() body: { userId: number; mode: 'approve' | 'reject' },
  ) {
    return this.userService.modeTransferOption(body.userId, body.mode);
  }

  @Get('view/all-transfer-requests')
  async findAllTransferRequests() {
    return this.userService.findAllTransferRequests();
  }

  @Post('approve-unlock-all')
  async approveUnlockAll() {
    return this.userService.approveAllUnlockRequests();
  }

  @Post('updateUserFromAdmin')
  async updateUserFromAdmin(
    @Body() dto: UpdateUserFromAdminDto & { id: number },
  ) {
    return this.userService.updateUserFromAdmin(dto.id, dto);
  }

  @Post('passenger/update/profile/:id')
  async updatePassengerInProfile(
    @Param('id') id: string,
    @Body() data: UpdatePassengerDto,
  ) {
    return this.userService.updatePassengerInProfile(id, data);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('updateMyInfo/:id')
  async updateMyInfo(
    @Body() dto: UpdateMyInfoDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.updateMyInfo(id, dto);
  }

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

  @Post('deleteMyAccount')
  async deleteMyAccount(
    @Body('id') id: number,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    const result = await this.userService.deleteMyAccount(id, token);
    return result;
  }

  @Post('attendance/delete')
  async deleteAttendance(@Body('id') id: number) {
    return this.userService.deleteAttendance(Number(id));
  }

  @Post('attendance/check-in')
  async checkIn(@Body('employeeId') employeeId: number) {
    return this.userService.checkIn(employeeId);
  }

  @Post('attendance/check-out')
  async checkOut(@Body('id') id: number) {
    return this.userService.checkOut(id);
  }

  @Get('attendance/all')
  async getAllAttendance() {
    return this.userService.getAllAttendance();
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

  @Get('search/by-month')
  async getTicketsByMonth(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe)
    year: number,
    @Query(
      'month',
      new DefaultValuePipe(new Date().getMonth() + 1),
      ParseIntPipe,
    )
    month: number,
  ) {
    const selectedYear = year || new Date().getFullYear();
    const selectedMonth = month || new Date().getMonth() + 1;

    const list = await this.userService.getDetailedTicketsByMonth(
      selectedYear,
      selectedMonth,
    );

    return {
      resultCode: '00',
      data: {
        year: selectedYear,
        month: selectedMonth,
        total: list?.formattedData.length,
        list,
      },
    };
  }
}
