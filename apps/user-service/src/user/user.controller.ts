import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUserDto';
import { LoginUserDto } from './dto/loginUser.dto';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';
import type { Request } from 'express';
import { updateUserDto } from './dto/updateUser.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    return await this.userService.register(body);
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() body: LoginUserDto) {
    const user = await this.userService.login(body);
    return {
      success: true,
      user: plainToInstance(User, user),
    };
  }

  @Get('/user/id/:id')
  async getUserById(@Param('id') id: number) {
    return await this.userService.getUserById(id);
  }

  @Get('/user/email/:email')
  async getUserByEmail(@Param('email') email: string) {
    return await this.userService.getUserByEmail(email);
  }

  @Get('/user/username/:username')
  async getUserByUserName(@Param('username') username: string) {
    return await this.userService.getUserByUserName(username);
  }

  @Patch('/user')
  async updateUser(@Req() req: Request, @Body() body: updateUserDto) {
    if (!req.headers['x-user-id'])
      throw new BadRequestException("Header's not found x-user-id");
    const userId = +req.headers['x-user-id'];
    return await this.userService.updateUser(userId, body);
  }

  @Delete('/user')
  async deleteUser(@Req() req: Request) {
    const userId = +req.headers['x-user-id']!;
    return await this.userService.deleteUser(userId);
  }
}
