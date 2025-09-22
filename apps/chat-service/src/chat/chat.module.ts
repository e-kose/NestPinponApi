import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import dbConfig from './config/db.config';
import { Message } from './entities/message.entity';
import { BlockedUser } from './entities/blocked_users.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true
    }),
    TypeOrmModule.forRootAsync({useFactory: dbConfig}),
    TypeOrmModule.forFeature([Message, BlockedUser])
  ],
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
