import { Injectable } from '@nestjs/common';
import { BatchUpdateEmployeeNoDto, CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import {
  Department,
  Position,
  Prisma,
  Role,
  TransferAdmin,
  User,
} from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { generatePassword } from './hooks/randompw';
import { UserResponseDto } from './dto/info-user-dto';
import { formatUserResponse } from 'src/common/helpers/hook';
import { Decimal } from 'generated/prisma/runtime/library';
import { MailService } from 'src/common/nodemailer/nodemailer.service';
import { decimalToDate, nowDecimal } from 'src/common/helpers/format';
import { UpdateUserFromAdminDto } from './dto/update-user-from-admin.dto';
import { v2 as cloudinary } from 'cloudinary';
import { CreateLeaveRequestDto } from './dto/leave-request.dto';
import { BatchUpdateResult } from './dto/user-response.dto';
import * as ExcelJS from 'exceljs';
import { Blob } from 'buffer';
import { RequestChangeRoleDto } from './dto/request-change-role.dto';
import { UpdateMyInfoDto } from './dto/update-my-info.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async randomPw() {
    const password = await generatePassword(true);
    return {
      resultCode: '00',
      resultMessage: 'Lấy temp password thành công!',
      data: password,
    };
  }

  async getAllUsers(): Promise<BaseResponseDto<Partial<UserResponseDto>>> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        rank: true,
        role: true,
        authType: true,
        userAlias: true,
        accountLockYn: true,
        mfaEnabledYn: true,
        attendance: true,
        baseSalary: true,
        department: true,
        position: true,
        hireDate: true,
        status: true,
        employeeNo: true,
        phone: true,
        createdAt: true, // chỉ select raw
      },
    });

    const mappedUsers = users.map((u) => ({
      ...u,
      createdAt: Number(u.createdAt),
    }));

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách người dùng thành công!',
      list: mappedUsers,
    };
  }

  async batchUpdateEmployeeNo(
    dto: BatchUpdateEmployeeNoDto,
  ): Promise<BaseResponseDto<BatchUpdateResult>> {
    const result: BatchUpdateResult[] = [];
    let hasError = false;

    try {
      for (const item of dto.updates) {
        const { userId, employeeNo } = item;

        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          result.push({
            userId,
            message: 'User not found',
          });
          hasError = true;
          continue;
        }

        // check duplicate employeeNo
        const existing = await this.prisma.user.findUnique({
          where: { employeeNo },
        });

        if (existing && existing.id !== userId) {
          result.push({
            userId,
            message: 'EmployeeNo already exists',
          });
          hasError = true;
          continue;
        }

        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: { employeeNo },
        });

        result.push({
          userId,
          employeeNo: updated.employeeNo,
        });
      }

      return {
        resultCode: hasError ? '09' : '00',
        resultMessage: hasError
          ? 'Batch update finished with errors'
          : 'Batch update finished successfully',
        list: result,
      };
    } catch (error) {
      console.error('error', error);
      return {
        resultCode: '09',
        resultMessage: 'Unexpected error',
      };
    }
  }

  async promoteRank(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error('User not found');

    const now = Date.now();
    const hireDate = user.hireDate ? Number(user.hireDate) : Date.now();
    const yearsWorked = (now - hireDate) / (1000 * 60 * 60 * 24 * 365);

    let newRank = user.rank || 'NONE';

    if (user.position === 'STAFF' && yearsWorked >= 2) newRank = 'MID';
    else if (user.position === 'SENIOR' && yearsWorked >= 4) newRank = 'LEAD';
    else if (user.position === 'MANAGER' && yearsWorked >= 5)
      newRank = 'PRINCIPAL';
    if (newRank !== user.rank) {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { rank: newRank || 'NONE' },
      });
    }
    return {
      resultCode: '00',
      resultMessage: 'Update rank người dùng thành công!',
    };
  }

  async getUserById(
    id: number,
  ): Promise<BaseResponseDto<Partial<UserResponseDto>>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        rank: true,
        role: true,
        authType: true,
        isEmailVerified: true,
        userAlias: true,
        accountLockYn: true,
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách người dùng thành công!',
      data: user,
    };
  }

  async getUserInfo(
    id: number,
  ): Promise<BaseResponseDto<Partial<UserResponseDto>>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        rank: true,
        role: true,
        authType: true,
        isEmailVerified: true,
        mfaEnabledYn: true,
        userAlias: true,
        accountLockYn: true,
        loginFailCnt: true,
        lastLoginDate: true,
        hireDate: true,
        status: true,
        baseSalary: true,
        attendance: true,
        position: true,
        fromTransferAdminUserYn: true,
        toTransferAdminUserYn: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        sessions: {
          select: {
            id: true,
            createdAt: true,
            userId: true,
          },
        },
      },
    });

    if (!user) {
      return {
        resultCode: '01',
        resultMessage: 'Không tìm thấy người dùng',
      };
    }

    const safeUser: UserResponseDto = {
      ...user,
      createdAt: (user.createdAt as Decimal).toNumber(),
      updatedAt: (user.updatedAt as Decimal).toNumber(),
      lastLoginDate: user.lastLoginDate
        ? (user.lastLoginDate as Decimal).toNumber()
        : undefined,
    };

    return {
      resultCode: '00',
      resultMessage: 'Lấy thông tin người dùng thành công!',
      data: safeUser,
    };
  }

  async createUserByAdmin(
    dto: CreateUserDto,
  ): Promise<BaseResponseDto<UserResponseDto | null>> {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existing) {
        return {
          resultCode: '01',
          resultMessage: 'Email đã tồn tại',
        };
      }

      const existingEmployeeNo = await this.prisma.user.findUnique({
        where: { employeeNo: dto.employeeNo },
      });

      if (existingEmployeeNo) {
        return {
          resultCode: '01',
          resultMessage: 'Employee No đã tồn tại',
        };
      }

      const defaultPassword = dto.password ?? generatePassword(true);
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          tempPassword: hashedPassword,
          name: dto.name ?? '',
          pictureUrl: '',
          role: dto.role as Role,
          authType: 'ID,PW',
          userAlias: '',
          createdAt: nowDecimal(),
          updatedAt: nowDecimal(),
        },
      });

      try {
        await this.mailService.sendMail(
          dto.email,
          'Tài khoản của bạn đã được tạo',
          `Xin chào ${dto.name ?? 'bạn'},\n\nTài khoản của bạn đã được tạo thành công.\nMật khẩu mặc định: ${defaultPassword}`,
          `<p>Xin chào <b>${dto.name ?? 'bạn'}</b>,</p>
       <p>Tài khoản của bạn đã được tạo thành công.</p>
       <p><b>Mật khẩu mặc định:</b> ${defaultPassword}</p>
       <p>Vui lòng đăng nhập và đổi mật khẩu ngay.</p>`,
        );
      } catch (err) {
        console.error('Gửi email thất bại:', err.message);
      }

      return {
        resultCode: '00',
        resultMessage: 'Tạo người dùng thành công!',
        data: formatUserResponse(user),
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Tạo người dùng khong thành công!',
      };
    }
  }

  async requestUnlock(employeeId: number, reason: string) {
    const existing = await this.prisma.unlockRequest.findFirst({
      where: {
        employeeId,
        status: 'PENDING',
      },
    });

    if (existing) {
      return {
        resultCode: '99',
        resultMessage: 'Bạn đã gửi yêu cầu mở khóa, vui lòng chờ xử lý!',
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: employeeId },
    });

    if (!user)
      return {
        resultCode: '99',
        resultMessage: 'User không tồn tại!',
      };

    if (user.accountLockYn !== 'Y') {
      return {
        resultCode: '99',
        resultMessage: 'Tài khoản chưa bị khóa, không cần mở khóa!',
      };
    }
    if (user.isEmailVerified !== 'Y') {
      return {
        resultCode: '99',
        resultMessage: 'Email chưa được xác thực, không thể mở khóa!',
      };
    }

    return this.prisma.unlockRequest.create({
      data: {
        employeeId,
        reason,
        createdAt: nowDecimal(),
      },
    });
  }

  async requestChangeRole(data: RequestChangeRoleDto) {
    const canTransferAdmin = await this.prisma.user.findUnique({
      where: { id: data.userId, fromTransferAdminUserYn: 'Y' },
    });

    if (!canTransferAdmin) {
      return { resultCode: '99', resultMessage: 'Khong the transfer!' };
    }
    const user = await this.prisma.user.findUnique({
      where: { employeeNo: data.employeeNo },
    });

    if (!user) {
      return { resultCode: '99', resultMessage: 'Nhân viên không tồn tại!' };
    }

    const existing = await this.prisma.transferAdmin.findFirst({
      where: { userId: user.id, status: 'PENDING' },
    });

    if (existing) {
      return {
        resultCode: '99',
        resultMessage: 'Bạn đã gửi yêu cầu, vui lòng chờ xử lý!',
      };
    }

    if (!user)
      return {
        resultCode: '99',
        resultMessage: 'User không tồn tại!',
      };

    if (user.accountLockYn === 'Y') {
      return {
        resultCode: '99',
        resultMessage: 'Tài khoản dang bị khóa, cần mở khóa de chuyen quyen!',
      };
    }
    if (user.isEmailVerified !== 'Y') {
      return {
        resultCode: '99',
        resultMessage: 'Email chưa được xác thực, không thể chuyen quyen!',
      };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { toTransferAdminUserYn: 'Y' },
    });

    await this.prisma.transferAdmin.create({
      data: {
        userId: user.id,
        fromUserId: data.fromUserId,
        toUserId: user.id,
        requestedAt: nowDecimal(),
        status: 'PENDING',
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Gửi yêu cầu chuyển quyền thành công, vui lòng chờ xử lý!',
    };
  }

  async modeTransferOption(userId: number, mode: 'approve' | 'reject') {
    try {
      const transfer = await this.prisma.transferAdmin.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!transfer) {
        return {
          resultCode: '01',
          resultMessage: `Không tìm thấy Transfer với userId = ${userId}`,
        };
      }

      let updatedTransfer: TransferAdmin | null = null;
      let updatedUser: User | null = null;

      if (mode === 'approve') {
        [updatedTransfer, updatedUser] = await this.prisma.$transaction([
          this.prisma.transferAdmin.update({
            where: { userId },
            data: {
              status: 'APPROVED',
              approvedAt: nowDecimal(),
            },
          }),
          this.prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN', updatedAt: nowDecimal() },
          }),
        ]);
      } else if (mode === 'reject') {
        updatedTransfer = await this.prisma.transferAdmin.update({
          where: { userId },
          data: { status: 'REJECTED' },
        });
      }

      return {
        resultCode: '00',
        resultMessage:
          mode === 'approve'
            ? 'Transfer approved thành công'
            : 'Transfer rejected thành công',
        data: {
          transfer: updatedTransfer,
          user: updatedUser,
        },
      };
    } catch (error) {
      console.error('Error on transfer:', error);
      throw error;
    }
  }

  // async rejectTransfer(userId: number) {
  //   try {
  //     const transfer = await this.prisma.transferAdmin.findUnique({
  //       where: { userId },
  //     });

  //     if (!transfer) {
  //       return {
  //         resultCode: '01',
  //         resultMessage: `Không tìm thấy Transfer với userId = ${userId}`,
  //       };
  //     }

  //     return await this.prisma.transferAdmin.update({
  //       where: { userId },
  //       data: { status: 'REJECTED' },
  //     });
  //   } catch (error) {
  //     console.error('Error rejecting transfer:', error);
  //     throw error;
  //   }
  // }

  async permissionToChangeRole(id: number, employeeNo: string) {
    try {
      const transfer = await this.prisma.user.findFirst({
        where: { id, employeeNo },
      });

      if (!transfer) {
        return {
          resultCode: '01',
          resultMessage: `Không tìm thấy userId = ${id} và employeeNo = ${employeeNo}`,
        };
      }

      await this.prisma.user.update({
        where: { id },
        data: { fromTransferAdminUserYn: 'Y' },
      });

      return {
        resultCode: '00',
        resultMessage: 'Cập nhật quyền thành công',
      };
    } catch (error) {
      console.error('Error updating transfer:', error);
      return {
        resultCode: '99',
        resultMessage: 'Có lỗi xảy ra khi cập nhật',
        error: error.message,
      };
    }
  }

  async findAllTransferRequests() {
    try {
      const transt = await this.prisma.transferAdmin.findMany({
        include: {
          user: {
            select: {
              id: true,
              role: true,
              email: true,
              name: true,
            },
          },
        },
      });
      return {
        resultCode: '00',
        resultMessage: 'Transfer data',
        list: transt,
      };
    } catch (error) {
      console.error('Error finding all user requests:', error);
      throw error;
    }
  }

  async getUserIdByEmail(email: string) {
    if (!email) {
      return {
        resultCode: '99',
        resultMessage: 'Vui lòng cung cấp email',
      };
    }
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return {
        resultCode: '99',
        resultMessage: 'Không tìm thấy người dùng với email này',
      };
    }

    return {
      resultCode: '00',
      resultMessage: 'Get Id người dùng thành công!',
      data: { userId: user.id },
    };
  }

  async deleteUnlockRequestById(id: number) {
    if (!id) {
      return {
        resultCode: '99',
        resultMessage: 'Vui lòng cung cấp id',
      };
    }

    // Kiểm tra tồn tại trước
    const existingLeaveRequest = await this.prisma.unlockRequest.findUnique({
      where: { id },
    });

    if (!existingLeaveRequest) {
      return {
        resultCode: '99',
        resultMessage: 'Không tìm thấy leaveRequest với id này',
      };
    }

    const deleted = await this.prisma.unlockRequest.delete({
      where: { id },
    });

    return {
      resultCode: '00',
      resultMessage: 'Xóa leaveRequest thành công!',
      data: { id: deleted.id },
    };
  }

  async approveUnlockRequest(requestId: number) {
    const req = await this.prisma.unlockRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!req) {
      return {
        resultCode: '01',
        resultMessage: 'Yêu cầu không tồn tại!',
      };
    }

    if (req.status !== 'PENDING') {
      return {
        resultCode: '01',
        resultMessage: 'Yêu cầu đã được xử lý!',
      };
    }

    await this.prisma.user.update({
      where: { id: req.employeeId },
      data: {
        accountLockYn: 'N',
        loginFailCnt: 0,
      },
    });

    await this.prisma.unlockRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approvedAt: nowDecimal(),
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Yêu cầu đã được duyệt và mở khóa.',
    };
  }

  async approveAllUnlockRequests() {
    const requests = await this.prisma.unlockRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
    });

    if (requests.length === 0) {
      return {
        resultCode: '99',
        resultMessage: 'Không có yêu cầu nào cần xử lý!',
      };
    }

    return this.prisma.$transaction(async (tx) => {
      for (const req of requests) {
        await tx.user.update({
          where: { id: req.employeeId },
          data: {
            accountLockYn: 'N',
            loginFailCnt: 0,
          },
        });

        await tx.unlockRequest.update({
          where: { id: req.id },
          data: {
            status: 'APPROVED',
            approvedAt: nowDecimal(),
          },
        });
      }

      return {
        resultCode: '00',
        resultMessage: `${requests.length} yêu cầu đã được duyệt và mở khóa.`,
      };
    });
  }

  async rejectUnlockRequest(requestId: number) {
    return this.prisma.unlockRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        approvedAt: nowDecimal(),
      },
    });
  }

  async findUserFromMessage(email: string, id: number) {
    try {
      const res = await this.prisma.user.findMany({
        where: {
          email: {
            contains: email,
          },
          NOT: {
            id,
          },
        },

        select: {
          id: true,
          email: true,
          name: true,
          employeeNo: true,
          role: true,
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Search người dùng thành công!',
        list: res,
      };
    } catch (error) {
      console.error('err', error);
    }
  }

  async updateMyInfo(id: number, updateUserDto: UpdateMyInfoDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return {
        resultCode: '99',
        resultMessage: `User with ID ${id} not found`,
      };
    }

    let pictureUrl = user.pictureUrl;
    if (
      updateUserDto.pictureUrl &&
      updateUserDto.pictureUrl !== user.pictureUrl
    ) {
      const uploadResponse = await cloudinary.uploader.upload(
        updateUserDto.pictureUrl as string,
      );
      pictureUrl = uploadResponse.secure_url;
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        name: updateUserDto.name ?? user.name,
        userAlias: updateUserDto.userAlias ?? user.userAlias,
        phone: updateUserDto.phone ?? user.phone,
        employeeNo: updateUserDto.employeeNo ?? user.employeeNo,
        pictureUrl,
        updatedAt: nowDecimal(),
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Cập nhật người dùng thành công!',
    };
  }

  async updateUserFromAdmin(id: number, updateUserDto: UpdateUserFromAdminDto) {
    try {
      if (!id) {
        return {
          resultCode: '99',
          resultMessage: 'User id is required',
        };
      }
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return {
          resultCode: '99',
          resultMessage: `User with ID ${id} not found`,
        };
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          status: updateUserDto.status,
          department: updateUserDto.department as Department,
          position: updateUserDto.position as Position,
          baseSalary: updateUserDto.baseSalary,
          // hireDate: updateUserDto.hireDate,
        },
        select: { id: true },
      });

      return {
        resultCode: '00',
        resultMessage: 'Cập nhật người dùng thành công!',
        data: updatedUser,
      };
    } catch (error) {
      console.error('err', error);
      throw error;
    }
  }

  async deleteAllUsers() {
    try {
      const result = await this.prisma.user.deleteMany({});
      return {
        resultCode: '00',
        resultMessage: `Xoá toàn bộ người dùng thành công! (Đã xoá ${result.count} user)`,
      };
    } catch (error) {
      console.error('Error deleting users:', error);

      return {
        resultCode: '99',
        resultMessage: error.message,
      };
    }
  }

  async setAccountLockChange(
    id: number,
  ): Promise<BaseResponseDto<{ accountLockYn: string }>> {
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: { accountLockYn: true },
    });
    if (!current) {
      return { resultCode: '01', resultMessage: 'User không tồn tại!' };
    }

    const newValue = current.accountLockYn === 'N' ? 'Y' : 'N';
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { accountLockYn: newValue },
      select: { accountLockYn: true },
    });

    return {
      resultCode: '00',
      resultMessage: `Đã đổi trạng thái accountLockYn từ ${current.accountLockYn} → ${updatedUser.accountLockYn} thành công!`,
      data: updatedUser,
    };
  }

  async deleteUser(id: number) {
    try {
      const current = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!current) {
        return { resultCode: '01', resultMessage: 'User không tồn tại!' };
      }

      await this.prisma.user.delete({ where: { id } });

      return {
        resultCode: '00',
        resultMessage: `Đã delete success!`,
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async checkIn(employeeId: number) {
    return this.prisma.attendance.create({
      data: {
        employeeId,
        date: nowDecimal(),
        checkIn: nowDecimal(),
        checkOut: new Prisma.Decimal(0),
        status: 'PRESENT',
        createdAt: nowDecimal(),
      },
    });
  }

  async checkOut(attendanceId: number) {
    const checkOutTime = nowDecimal();
    const record = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { checkOut: checkOutTime },
    });
    return record;
  }

  async deleteAttendance(employeeId: number) {
    this.prisma.attendance.delete({
      where: {
        id: employeeId,
      },
    });
    return {
      resultCode: '00',
      resultMessage: 'Attendance delete successfully',
    };
  }

  async createLeaveRequest(createDto: CreateLeaveRequestDto) {
    const employee = await this.prisma.user.findUnique({
      where: { id: createDto.employeeId },
    });

    if (!employee) {
      return {
        resultCode: '01',
        resultMessage: `Employee not found!`,
      };
    }

    // Tạo đơn nghỉ phép
    const leaveRequest = await this.prisma.leaveRequest.create({
      data: {
        ...createDto, // copy các field từ DTO
        appliedAt: nowDecimal(),
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Leave request created successfully',
      data: leaveRequest,
    };
  }

  async getAllLeaveRequests() {
    try {
      const leaveRequests = await this.prisma.leaveRequest.findMany({
        select: {
          id: true,
          leaveType: true,
          reason: true,
          startDate: true,
          endDate: true,
          days: true,
          status: true,
          employeeId: true,
          appliedAt: true,
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          appliedAt: 'desc',
        },
      });

      return {
        resultCode: '00',
        resultMessage: 'Success',
        list: leaveRequests,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Error fetching leave requests',
        error: error.message,
      };
    }
  }

  async deleteLeaveRequestById(id: number) {
    try {
      // Xóa tất cả leave requests
      await this.prisma.leaveRequest.deleteMany({
        where: {
          id,
        },
      });

      return {
        resultCode: '00',
        resultMessage: `Đã xóa leave requests ${id} thành công`,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: error,
      };
    }
  }

  async deleteAllLeaveRequests() {
    try {
      // Xóa tất cả leave requests
      const deleteResult = await this.prisma.leaveRequest.deleteMany({});

      return {
        resultCode: '00',
        resultMessage: `Đã xóa ${deleteResult.count} leave requests thành công`,
      };
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: error,
      };
    }
  }

  async checkEmployeeLeaveRequest(employeeId: number) {
    try {
      const currentTimestamp = nowDecimal();
      const existingRequest = await this.prisma.leaveRequest.findFirst({
        where: {
          employeeId: employeeId,
          OR: [
            { status: 'PENDING' },
            {
              status: 'APPROVED',
              startDate: { gte: nowDecimal() },
            },
          ],
        },
        select: {
          id: true,
          leaveType: true,
          status: true,
          appliedAt: true,
          startDate: true,
          endDate: true,
        },
        orderBy: {
          appliedAt: 'desc',
        },
      });

      if (existingRequest) {
        return {
          resultCode: '00',
          resultMessage: 'Đã tạo leave request',
          request: {
            ...existingRequest,
            appliedAt: existingRequest.appliedAt.toNumber(),
            startDate: existingRequest.startDate.toNumber(),
            endDate: existingRequest.endDate?.toNumber(),
          },
        };
      } else {
        return {
          resultCode: '09',
          resultMessage: 'Chưa tạo leave request',
        };
      }
    } catch (error) {
      return {
        resultCode: '99',
        resultMessage: 'Lỗi khi kiểm tra leave request',
        error: error.message,
      };
    }
  }

  async approveLeaveRequest(
    requestId: number,
    approverId: number,
    note?: string,
  ) {
    if (!requestId || !approverId) {
      return {
        resultCode: '03',
        resultMessage: 'Request ID and Approver ID are required',
      };
    }

    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return {
        resultCode: '01',
        resultMessage: 'Leave request not found!',
      };
    }

    if (request.status !== 'PENDING') {
      return {
        resultCode: '02',
        resultMessage: `Cannot approve request that is already ${request.status.toLowerCase()}`,
        currentStatus: request.status,
      };
    }

    // 4. Kiểm tra approver không phải là chính employee
    if (request.employeeId === approverId) {
      return {
        resultCode: '04',
        resultMessage: 'Approver cannot be the same as the requester',
      };
    }

    await this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approverId,
        approverNote: note,
        decidedAt: nowDecimal(),
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Leave request approved',
    };
  }

  async rejectLeaveRequest(
    requestId: number,
    approverId: number,
    note?: string,
  ) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return {
        resultCode: '01',
        resultMessage: 'Leave request not found!',
      };
    }

    await this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        approverId,
        approverNote: note,
        decidedAt: nowDecimal(),
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Leave request rejected',
    };
  }

  async exportPayrollsToExcel() {
    try {
      const payrolls = await this.prisma.payroll.findMany({
        include: { employee: true },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Payrolls');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Mã NV', key: 'employeeNo', width: 15 },
        { header: 'Tên nhân viên', key: 'employeeName', width: 25 },
        { header: 'Tháng', key: 'month', width: 10 },
        { header: 'Năm', key: 'year', width: 10 },
        { header: 'Lương', key: 'salary', width: 15 },
        { header: 'Thưởng', key: 'netPay', width: 15 },
      ];

      payrolls.forEach((p) => {
        worksheet.addRow({
          id: p.id,
          employeeNo: p.employee.employeeNo,
          employeeName: p.employee.name,
          month: p.month,
          year: p.year,
          salary: p.baseSalary,
          netPay: p.netPay,
        });
      });

      // Style cho header (hàng 1)
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }; // trắng
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 20;

      // Nền header xanh dương
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4472C4' }, // xanh
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Style cho toàn bộ bảng (border + alignment)
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          // Nếu là header thì giữ style header
          if (rowNumber !== 1) {
            if (typeof cell.value === 'number') {
              cell.alignment = { horizontal: 'right' }; // căn phải số
            } else {
              cell.alignment = { horizontal: 'left' }; // căn trái text
            }
          }
        });
      });

      // Xuất file excel ra buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Convert sang base64 để FE xử lý tải file
      const base64 = Buffer.from(buffer).toString('base64');

      return {
        resultCode: '00',
        resultMessage: 'Xuất excel thành công',
        data: base64,
      };
    } catch (error) {
      console.error('error', error);
      return {
        resultCode: '99',
        resultMessage: 'Xuất excel thất bại',
        data: null,
      };
    }
  }

  async exportFlightsToExcel() {
    try {
      const flights = await this.prisma.flight.findMany({
        include: { bookings: true },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Flights');

      worksheet.columns = [
        { header: 'Flight ID', key: 'flightId', width: 10 },
        { header: 'Flight No', key: 'flightNo', width: 15 },
        { header: 'Departure Airport', key: 'departureAirport', width: 20 },
        { header: 'Arrival Airport', key: 'arrivalAirport', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Aircraft Code', key: 'aircraftCode', width: 15 },
        { header: 'Scheduled Departure', key: 'scheduledDeparture', width: 25 },
        { header: 'Scheduled Arrival', key: 'scheduledArrival', width: 25 },
        { header: 'Actual Departure', key: 'actualDeparture', width: 25 },
        { header: 'Actual Arrival', key: 'actualArrival', width: 25 },
        { header: 'Delay Minutes', key: 'delayMinutes', width: 15 },
        { header: 'Flight Type', key: 'flightType', width: 15 },
        { header: 'Cancelled', key: 'isCancelled', width: 10 },
        { header: 'Price Business', key: 'priceBusiness', width: 15 },
        { header: 'Price Economy', key: 'priceEconomy', width: 15 },
        { header: 'Price First', key: 'priceFirst', width: 15 },
      ];
      flights.forEach((f) => {
        worksheet.addRow({
          flightId: f.flightId,
          flightNo: f.flightNo,
          departureAirport: f.departureAirport,
          arrivalAirport: f.arrivalAirport,
          status: f.status,
          aircraftCode: f.aircraftCode,
          scheduledDeparture: decimalToDate(f.scheduledDeparture),
          scheduledArrival: decimalToDate(f.scheduledArrival),
          actualDeparture: decimalToDate(f.actualDeparture) ?? '',
          actualArrival: decimalToDate(f.actualArrival) ?? '',
          delayMinutes: f.delayMinutes ?? '',
          flightType: f.flightType,
          isCancelled: f.isCancelled ? 'Yes' : 'No',
          priceBusiness: f.priceBusiness ?? '',
          priceEconomy: f.priceEconomy ?? '',
          priceFirst: f.priceFirst ?? '',
        });
      });

      // Style cho header (hàng 1)
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }; // trắng
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 20;

      // Nền header xanh dương
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4472C4' }, // xanh
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Style cho toàn bộ bảng (border + alignment)
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };

          // Nếu là header thì giữ style header
          if (rowNumber !== 1) {
            if (typeof cell.value === 'number') {
              cell.alignment = { horizontal: 'right' }; // căn phải số
            } else {
              cell.alignment = { horizontal: 'left' }; // căn trái text
            }
          }
        });
      });

      // Xuất file excel ra buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Convert sang base64 để FE xử lý tải file
      const base64 = Buffer.from(buffer).toString('base64');

      return {
        resultCode: '00',
        resultMessage: 'Xuất excel thành công',
        data: base64,
      };
    } catch (error) {
      console.error('error', error);
      return {
        resultCode: '99',
        resultMessage: 'Xuất excel thất bại',
        data: null,
      };
    }
  }
}
