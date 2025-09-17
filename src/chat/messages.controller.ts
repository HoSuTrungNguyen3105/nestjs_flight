import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('sys/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Post('delete/:id')
  deleteMessage(@Param('id') id: number) {
    return this.messagesService.deleteMessage(+id);
  }

  @Get(':user1Id/:user2Id')
  findMessagesBetweenUsers(
    @Param('user1Id') user1Id: string,
    @Param('user2Id') user2Id: string,
  ) {
    return this.messagesService.findMessagesBetweenUsers(
      parseInt(user1Id),
      parseInt(user2Id),
    );
  }

  @Get('received/:userId')
  findReceivedMessages(@Param('userId') userId: number) {
    return this.messagesService.findReceivedMessages(+userId);
  }

  @Get('sender/:userId')
  findSenderMessages(@Param('userId') userId: number) {
    return this.messagesService.findSenderMessages(+userId);
  }
}
