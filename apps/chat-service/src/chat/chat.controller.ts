import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { reqFromFindUser } from './utils/utils';
import { catchErrorFunction } from './utils/catchError';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/conversation/id/:id')
  async getConveration(
    @Param('id') otherUser: number,
    @Req() req: Request,
    @Query('offset') offset: number = 0,
    @Query('limit') limit: number = 20,
  ) {
    const currentUser = reqFromFindUser(req);
    try {
      const chat = await this.chatService.getConversation(
        currentUser,
        otherUser,
        limit,
        offset,
      );
      if (!chat.length)
        throw new HttpException(
          { success: false, message: 'Chat history not found' },
          404,
        );
      return { succes: true, chat };
    } catch (error) {
      catchErrorFunction(error);
    }
  }

  @Post('/block/id/:id')
  async blockUser(@Param('id') blockedId: number, @Req() req: Request) {
    const blockingId = reqFromFindUser(req);
    const data = await this.chatService.blockUser(+blockingId, +blockedId);
    return {success: true, message: 'User blocked', data };
  }

  @HttpCode(200)
  @Post('/remove-block/id/:id')
  async removeBlock(@Param('id') blockedId: number, @Req() req: Request) {
    const blockingId = reqFromFindUser(req);
    const data = await this.chatService.removeBlock(+blockingId, +blockedId);
    return {succes: true, message: 'The user block has been removed.', data}
  }
}
