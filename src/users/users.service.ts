import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Role } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generatePassword } from './hooks/randompw';
import { UserResponseDto } from './dto/info-user-dto';
import { formatUserResponse, toEpochDecimal } from 'src/common/helpers/hook';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  // private readonly userRepository: Repository<User>{}// ✅ Repository ở đây nè anh
  async randomPw() {
    const password = await generatePassword(true);
    return {
      resultCode: '00',
      data: password, // dùng list thay vì data vì là mảng
    };
  }
  // Lấy tất cả user
  async getAllUsers(): Promise<BaseResponseDto<Partial<UserResponseDto>>> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        rank: true,
        role: true,
        authType: true,
        userAlias: true,
        loginFailCnt: true,
        accountLockYn: true,
        mfaEnabledYn: true,
        createdAt: true,
        mfaSecretKey: true,
        // ❌ Không trả password và prevPassword
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách người dùng thành công!',
      list: users, // list là T[] nên ở đây T = Partial<User>
    };
  }

  // Lấy user theo ID
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
        mfaEnabledYn: true,
        userAlias: true,
        // loginFailCnt: true,
        accountLockYn: true,
        // ❌ Không trả password và prevPassword
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách người dùng thành công!',
      data: user, // dùng list thay vì data vì là mảng
    };
  }
  findAll() {
    return this.prisma.user.findMany();
  }
  async createUserByAdmin(
    dto: CreateUserDto,
  ): Promise<BaseResponseDto<UserResponseDto | null>> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email đã tồn tại');
    }

    const defaultPassword = dto.password ?? generatePassword(true);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name ?? '',
        pictureUrl: '',
        rank: '',
        role: dto.role as Role,
        authType: 'ID,PW',
        userAlias: '',
        createdAt: toEpochDecimal(), // lưu Decimal
        updatedAt: toEpochDecimal(),
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Tạo người dùng thành công!',
      data: formatUserResponse(user), // ✅ format đúng kiểu DTO
    };
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUserById(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Kiểm tra role cũ và role mới
    const isRoleChangingToAdmin =
      updateUserDto.role === Role.ADMIN && user.role !== Role.ADMIN;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name: updateUserDto.name,
        pictureUrl: updateUserDto.pictureUrl,
        rank: updateUserDto.rank,
        role: updateUserDto.role,
        userAlias: updateUserDto.userAlias,
        updatedAt: toEpochDecimal(),
      },
      select: {
        id: true,
        name: true,
        pictureUrl: true,
        rank: true,
        role: true,
        userAlias: true,
      },
    });

    // Nếu đổi role thành ADMIN thì tạo request TransferAdmin
    if (isRoleChangingToAdmin) {
      // Ví dụ: tìm 1 admin hiện tại để gán làm "toUserId"
      const existingAdmin = await this.prisma.user.findFirst({
        where: { role: Role.ADMIN, NOT: { id: updatedUser.id } },
        select: { id: true },
      });

      await this.prisma.transferAdmin.create({
        data: {
          userId: updatedUser.id,
          fromUserId: updatedUser.id, // hoặc lấy từ JWT user hiện tại
          toUserId: existingAdmin ? existingAdmin.id : updatedUser.id,
          status: 'PENDING',
          requestedAt: toEpochDecimal(),
          approvedAt: null, // ✅ null hợp lệ
        },
      });
    }

    return {
      resultCode: '00',
      resultMessage: 'Cập nhật người dùng thành công!',
      data: updatedUser,
      result: isRoleChangingToAdmin
        ? 'Đã tạo request TransferAdmin'
        : 'Không có thay đổi role',
    };
  }

  // user.service.ts
  async deleteAllUsers() {
    await this.prisma.user.deleteMany({}); // Không truyền where -> xoá hết
    return {
      resultCode: '00',
      resultMessage: 'Xoá toàn bộ người dùng thành công!',
    };
  }

  // async setAccountLockChange(
  //   id: number,
  //   accountLockYn: string,
  // ): Promise<BaseResponseDto<null>> {
  //   const currentUser = await this.prisma.user.findUnique({
  //     where: { id },
  //     select: { accountLockYn: true },
  //   });
  //   console.log(
  //     'Giá trị thật trong DB trước khi đổi:',
  //     currentUser?.accountLockYn,
  //   );
  //   console.log('Giá trị được truyền vào hàm:', accountLockYn);

  //   const newValue = currentUser?.accountLockYn === 'N' ? 'Y' : 'N';

  //   // await this.prisma.user.update({
  //   //   where: { id },
  //   //   data: { accountLockYn: newValue },
  //   // });
  //   // const newValue = accountLockYn === 'N' ? 'Y' : 'N';

  //   await this.prisma.user.update({
  //     where: { id },
  //     data: { accountLockYn: newValue },
  //   });

  //   return {
  //     resultCode: '00',
  //     resultMessage: `Đã đổi trạng thái accountLockYn từ ${accountLockYn} → ${newValue} thành công!`,
  //   };
  // }
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

  delete(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
