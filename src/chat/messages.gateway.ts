import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST'],
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Khi client kết nối
  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);

    // Client gửi userId khi kết nối
    client.on('register_user', (userId: number) => {
      client.join(`user_${userId}`);
      console.log(`User ${userId} joined room: user_${userId}`);
    });
  }

  // Khi client ngắt kết nối
  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // Phát tin nhắn mới đến các room
  broadcastNewMessage(message: any) {
    this.server.to(`user_${message.senderId}`).emit('new_message', message);
    this.server.to(`user_${message.receiverId}`).emit('new_message', message);
    console.log('Message broadcasted:', message);
  }

  // Lắng nghe sự kiện typing
  @SubscribeMessage('typing_start')
  handleTypingStart(
    client: Socket,
    data: { senderId: number; receiverId: number },
  ) {
    client.to(`user_${data.receiverId}`).emit('user_typing', {
      senderId: data.senderId,
      typing: true,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    client: Socket,
    data: { senderId: number; receiverId: number },
  ) {
    client.to(`user_${data.receiverId}`).emit('user_typing', {
      senderId: data.senderId,
      typing: false,
    });
  }
}
