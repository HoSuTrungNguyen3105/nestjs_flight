import { forwardRef, Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [
    forwardRef(() => PrismaModule), // nếu circular với module khác
  ],
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController],
  // providers: [
  //   MessagesService,
  //   {
  //     provide: MessagesGateway,
  //     useClass: forwardRef(() => MessagesGateway),
  //   },
  // ],
  exports: [MessagesService],
  // exports: [MessagesService],
})
export class MessagesModule {}
