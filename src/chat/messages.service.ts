import { Injectable } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private messagesGateway: MessagesGateway,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const { content, senderId, receiverId } = createMessageDto;

    // Tạo tin nhắn trong database
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        createdAt: new Date().getTime().toString(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
            email: true,
          },
        },
      },
    });

    // Phát tin nhắn qua WebSocket
    this.messagesGateway.broadcastNewMessage(message);

    return message;
  }

  async findMessagesBetweenUsers(user1Id: number, user2Id: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            pictureUrl: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
