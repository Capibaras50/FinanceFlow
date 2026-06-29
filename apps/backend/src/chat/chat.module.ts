import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './controllers/chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/chat.entity';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), AiModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
