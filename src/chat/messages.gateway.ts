import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { nowDecimal } from 'src/common/helpers/format';
import { PrismaService } from 'src/prisma.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  constructor(private prisma: PrismaService) {}
  private connectedClients = new Map<string, number>();

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token || client.handshake.query.token;
    console.log('Client connected:', client.id);
    console.log('token connected:', token);
    if (!token) {
      console.log('No token, disconnecting client:', client.id);
      client.disconnect(true); // true: close ngay lập tức
      return;
    }
    client.on('register_user', (userId: number) => {
      if (this.connectedClients.get(client.id) === userId) {
        return;
      }

      this.connectedClients.set(client.id, userId);
      client.join(`user_${userId}`);
      console.log(`User ${userId} joined room: user_${userId}`);
    });
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    const userId = this.connectedClients.get(client.id);
    if (userId) {
      console.log(`User ${userId} disconnected`);
      this.connectedClients.delete(client.id);
    }
  }

  broadcastNewMessage(message: any) {
    this.server.to(`user_${message.senderId}`).emit('new_message', message);
    this.server.to(`user_${message.receiverId}`).emit('new_message', message);
    console.log('Message broadcasted to rooms:', {
      senderRoom: `user_${message.senderId}`,
      receiverRoom: `user_${message.receiverId}`,
      messageId: message.id,
    });
  }

  // @SubscribeMessage('typing_start')
  // handleTypingStart(
  //   client: Socket,
  //   data: { senderId: number; receiverId: number },
  // ) {
  //   const userId = this.connectedClients.get(client.id);
  //   if (!userId) return;

  //   client.to(`user_${data.receiverId}`).emit('user_typing', {
  //     senderId: data.senderId,
  //     typing: true,
  //   });
  // }

  // @SubscribeMessage('typing_stop')
  // handleTypingStop(
  //   client: Socket,
  //   data: { senderId: number; receiverId: number },
  // ) {
  //   const userId = this.connectedClients.get(client.id);
  //   if (!userId) return;

  //   client.to(`user_${data.receiverId}`).emit('user_typing', {
  //     senderId: data.senderId,
  //     typing: false,
  //   });
  // }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: { senderId: number; receiverId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const now = nowDecimal();
    const message = await this.prisma.message.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        createdAt: now,
      },
    });

    this.server.to(`user_${data.receiverId}`).emit('receive_message', message);

    client.emit('message_sent', message);
  }

  // handleConnection(client: Socket) {
  //   const userId = client.handshake.auth.userId;
  //   if (userId) {
  //     client.join(`user_${userId}`);
  //     console.log(`User ${userId} connected`);
  //   }
  // }

  // handleDisconnect(client: Socket) {
  //   console.log('Client disconnected:', client.id);
  // }
}
