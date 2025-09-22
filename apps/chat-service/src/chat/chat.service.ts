import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { BlockedUser } from './entities/blocked_users.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(BlockedUser)
    private readonly blockRepo: Repository<BlockedUser>,
  ) {}

  async getConversation(currentUser: number, otherUser: number, limit: number, offset: number) {
    const messages = await this.messageRepo.find({
      where: [
        { sender_id: currentUser, recv_id: otherUser },
        { sender_id: otherUser, recv_id: currentUser },
      ],
	  order: {created_at: "ASC"},
	  take: limit,
	  skip: offset
    });
	return messages;
  }
}
