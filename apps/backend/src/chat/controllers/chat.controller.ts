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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Message } from '../entities/chat.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Throttle({ default: { ttl: 600000, limit: 10 } })
  @Post()
  @ApiBody({ type: CreateChatDto })
  @ApiCreatedResponse({
    description: 'Send a message to AI',
    type: Message,
  })
  @ApiBadRequestResponse({
    description: 'The Message Couldnt Be Sent',
  })
  create(
    @Body() createChatDto: CreateChatDto,
    @GetUser('profileId') profileId: number,
  ) {
    return this.chatService.sendMessage(createChatDto, profileId);
  }

  @Get()
  @ApiOkResponse({
    description: 'Return all messages of user',
    type: [Message],
  })
  getRecord(
    @GetUser('profileId') profileId: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.findAllMessages(profileId, limit);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({
    description: 'Delete one message of user',
  })
  @ApiNotFoundResponse({
    description: 'The Message Not Found',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.chatService.removeMessage(id, profileId);
  }
}
