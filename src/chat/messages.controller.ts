import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
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
}
