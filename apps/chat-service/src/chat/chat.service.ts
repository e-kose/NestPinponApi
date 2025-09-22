import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { BlockedUser } from './entities/blocked_users.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { catchErrorFunction } from './utils/catchError';

@Injectable()
export class ChatService {
  userService = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(BlockedUser)
    private readonly blockRepo: Repository<BlockedUser>,
    private readonly httpService: HttpService,
  ) {}

  async getConversation(
    currentUser: number,
    otherUser: number,
    limit: number,
    offset: number,
  ) {
    const messages = await this.messageRepo.find({
      where: [
        { sender_id: currentUser, recv_id: otherUser },
        { sender_id: otherUser, recv_id: currentUser },
      ],
      order: { created_at: 'ASC' },
      take: limit,
      skip: offset,
    });
    return messages;
  }

  async blockUser(blocking_id: number, blocked_id: number) {
    try {
      await firstValueFrom(
        this.httpService.get(this.userService + `/user/id/${blocked_id}`),
      );
      const isExist = await this.blockRepo.findOne({
        where: { blocked_id, blocking_id },
        withDeleted: true,
      });
      if (isExist && !isExist.deleted_at) {
        throw new HttpException(
          {
            success: false,
            message: 'The user is already blocked.',
          },
          400,
        );
      } else if (isExist && isExist.deleted_at) {
        await this.blockRepo.restore(isExist.id);
        return await this.blockRepo.findOneBy({id: isExist.id});
      }
      const data = this.blockRepo.create({ blocking_id, blocked_id });
      return await this.blockRepo.save(data);
    } catch (error) {
      catchErrorFunction(error);
    }
  }

  async removeBlock(blocking_id: number, blocked_id: number) {
    try {
      await firstValueFrom(
        this.httpService.get(this.userService + `/user/id/${blocked_id}`),
      );
      const isExist = await this.blockRepo.findOne({
        where: { blocked_id, blocking_id },
      });
      if (!isExist) {
        throw new HttpException(
          {
            success: false,
            message: 'The user is not already blocked.',
          },
          400,
        );
      }
      return await this.blockRepo.softDelete(isExist.id);
    } catch (error) {
      catchErrorFunction(error);
    }
  }
}
