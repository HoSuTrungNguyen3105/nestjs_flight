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
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, number>(); // Lưu trữ clientId -> userId

  // Khi client kết nối
  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);

    // Client gửi userId khi kết nối
    client.on('register_user', (userId: number) => {
      // Kiểm tra nếu client đã đăng ký rồi thì không xử lý lại
      if (this.connectedClients.get(client.id) === userId) {
        return;
      }

      // Lưu thông tin client
      this.connectedClients.set(client.id, userId);
      client.join(`user_${userId}`);
      console.log(`User ${userId} joined room: user_${userId}`);
    });
  }

  // Khi client ngắt kết nối
  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);

    // Xóa client khỏi danh sách
    const userId = this.connectedClients.get(client.id);
    if (userId) {
      console.log(`User ${userId} disconnected`);
      this.connectedClients.delete(client.id);
    }
  }

  // Phát tin nhắn mới đến các room
  broadcastNewMessage(message: any) {
    this.server.to(`user_${message.senderId}`).emit('new_message', message);
    this.server.to(`user_${message.receiverId}`).emit('new_message', message);
    console.log('Message broadcasted to rooms:', {
      senderRoom: `user_${message.senderId}`,
      receiverRoom: `user_${message.receiverId}`,
      messageId: message.id,
    });
  }

  // Lắng nghe sự kiện typing
  @SubscribeMessage('typing_start')
  handleTypingStart(
    client: Socket,
    data: { senderId: number; receiverId: number },
  ) {
    const userId = this.connectedClients.get(client.id);
    if (!userId) return;

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
    const userId = this.connectedClients.get(client.id);
    if (!userId) return;

    client.to(`user_${data.receiverId}`).emit('user_typing', {
      senderId: data.senderId,
      typing: false,
    });
  }
}

// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({
//   cors: {
//     origin: 'http://localhost:5173', // Frontend URL
//     methods: ['GET', 'POST'],
//   },
// })
// export class MessagesGateway
//   implements OnGatewayConnection, OnGatewayDisconnect
// {
//   @WebSocketServer()
//   server: Server;

//   // Khi client kết nối
//   handleConnection(client: Socket) {
//     console.log('Client connected:', client.id);

//     // Client gửi userId khi kết nối
//     client.on('register_user', (userId: number) => {
//       client.join(`user_${userId}`);
//       console.log(`User ${userId} joined room: user_${userId}`);
//     });
//   }

//   // Khi client ngắt kết nối
//   handleDisconnect(client: Socket) {
//     console.log('Client disconnected:', client.id);
//   }

//   // Phát tin nhắn mới đến các room
//   broadcastNewMessage(message: any) {
//     this.server.to(`user_${message.senderId}`).emit('new_message', message);
//     this.server.to(`user_${message.receiverId}`).emit('new_message', message);
//     console.log('Message broadcasted:', message);
//   }

//   // Lắng nghe sự kiện typing
//   @SubscribeMessage('typing_start')
//   handleTypingStart(
//     client: Socket,
//     data: { senderId: number; receiverId: number },
//   ) {
//     client.to(`user_${data.receiverId}`).emit('user_typing', {
//       senderId: data.senderId,
//       typing: true,
//     });
//   }

//   @SubscribeMessage('typing_stop')
//   handleTypingStop(
//     client: Socket,
//     data: { senderId: number; receiverId: number },
//   ) {
//     client.to(`user_${data.receiverId}`).emit('user_typing', {
//       senderId: data.senderId,
//       typing: false,
//     });
//   }
// }
