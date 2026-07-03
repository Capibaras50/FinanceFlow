import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { CreateChatDto } from '../dto/create-chat.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Throttle({ default: { ttl: 600000, limit: 10 } })
  @Post()
  create(
    @Body() createChatDto: CreateChatDto,
    @GetUser('profileId') profileId: number,
  ) {
    return this.chatService.sendMessage(createChatDto, profileId);
  }

  @Get()
  getRecord(
    @GetUser('profileId') profileId: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.findAllMessages(profileId, limit);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.chatService.removeMessage(id, profileId);
  }
}
