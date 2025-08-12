import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Role, User } from 'generated/prisma';
import { BaseResponseDto } from 'src/baseResponse/response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generatePassword } from './hooks/randompw';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  // private readonly userRepository: Repository<User>{}// ✅ Repository ở đây nè anh
  async randomPw() {
    const password = await generatePassword(true);
    return {
      resultCode: '00',
      resultMessage: 'Get random password thành công!',
      data: password, // dùng list thay vì data vì là mảng
    };
    // console.log('Mật khẩu random:', password);
    //return password;
    // Lưu user với password đã hash (BCrypt)
  }
  // Lấy tất cả user
  async getAllUsers(): Promise<BaseResponseDto<Partial<User>>> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        rank: true,
        role: true,
        createdAt: true,
        authType: true,
        userAlias: true,
        loginFailCnt: true,
        accountLockYn: true,
        mfaEnabledYn: true,
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
  ): Promise<BaseResponseDto<Partial<User> | null>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        pictureUrl: true,
        rank: true,
        role: true,
        createdAt: true,
        authType: true,
        userAlias: true,
        loginFailCnt: true,
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
  ): Promise<BaseResponseDto<User | null>> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email đã tồn tại');
    }
    // function generateRandomPassword(length: number = 8): string {
    //   const chars =
    //     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    //   let password = '';
    //   for (let i = 0; i < length; i++) {
    //     const randomChar = chars.charAt(
    //       Math.floor(Math.random() * chars.length),
    //     );
    //     password += randomChar;
    //   }
    //   return password;
    // }

    const defaultPassword = dto.password ?? generatePassword(true); // 8 hoặc 12 tùy nhu cầu
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
        createdAt: new Prisma.Decimal(Date.now()), // milliseconds
        updatedAt: new Prisma.Decimal(Date.now()), // milliseconds
      },
    });

    return {
      resultCode: '00',
      resultMessage: 'Lấy danh sách người dùng thành công!',
      data: user, // dùng list thay vì data vì là mảng
    };
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  // update(id: number, data: Partial<User>) {
  //   return this.prisma.user.update({ where: { id }, data });
  // }
  // async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
  //   const user = await this.prisma.user.findUnique({ id });
  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${id} not found`);
  //   }
  //   const updated = Object.assign(user, updateUserDto);
  //   return await this.user.save(updated);
  // }
  // async update(id: number, updateUserDto: UpdateUserDto) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id },
  //   });

  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${id} not found`);
  //   }

  //   // Map role về kiểu enum nếu có
  //   const data: Prisma.UserUpdateInput = {
  //     ...updateUserDto,
  //     role: updateUserDto.role ? (updateUserDto.role as Role) : undefined,
  //   };

  //   const updatedUser = await this.prisma.user.update({
  //     where: { id },
  //     data,
  //   });
  //   return {
  //     resultCode: '00',
  //     resultMessage: 'Lấy danh sách người dùng thành công!',
  //     data: updatedUser, // dùng list thay vì data vì là mảng
  //   };
  // }

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
      await this.prisma.transferAdmin.create({
        data: {
          userId: updatedUser.id,
          fromUserId: 0, // Anh cần xác định ai là người request (có thể lấy từ JWT user hiện tại)
          toUserId: updatedUser.id,
          status: 'PENDING',
        },
      });
    }

    return {
      resultCode: '00',
      resultMessage: 'Cập nhật người dùng thành công!',
      data: updatedUser,
    };

    // const data: Prisma.UserUpdateInput = {
    //   name: updateUserDto.name,
    //   pictureUrl: updateUserDto.pictureUrl,
    //   rank: updateUserDto.rank,
    //   role: updateUserDto.role,
    //   userAlias: updateUserDto.userAlias,
    // };

    // const updatedUser = await this.prisma.user.update({
    //   where: { id },
    //   data,
    // });

    // return {
    //   resultCode: '00',
    //   resultMessage: 'Cập nhật người dùng thành công!',
    //   data: updatedUser,
    // };
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
