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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUserDto';
import { LoginUserDto } from './dto/loginUserDto';
import { plainToInstance } from 'class-transformer';
import { User } from './entities/user.entity';
import type { Request } from 'express';
import { UpdatePasswordDto, UpdateUserDto } from './dto/updateUser.dto';
import { RegisterResponseDto } from './dto/response/register.dto';
import { ApiCustomResponses } from './decorator/api.response.decorator';
import { ErrorDto } from './dto/response/error.dto';
import { getUserDto } from './dto/response/getUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarApiBody } from './dto/updateUser.dto';
import { UpdateAvatarDto } from './dto/response/updateAvatar.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiSecurity('bearerAuth')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCustomResponses([
    {
      status: 201,
      description: 'Kullanıcı başarıyla oluşturuldu',
      type: RegisterResponseDto,
    },
    { status: 409, description: 'Kullanıcı zaten var', type: ErrorDto },
    { status: 400, description: 'Geçersiz veri', type: ErrorDto },
    { status: 500, description: 'Sunucu hatası', type: ErrorDto },
  ])
  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    return await this.userService.register(body);
  }

  @ApiCustomResponses([
    { status: 200, description: 'Giriş başarılı', type: getUserDto },
    { status: 400, description: 'Girdi hatası', type: ErrorDto },
    { status: 401, description: 'Kullanıcı doğrulanamadı', type: ErrorDto },
    { status: 404, description: 'Kullanıcı bulunamadı', type: ErrorDto },
    { status: 500, description: 'Sunucu hatası', type: ErrorDto },
  ])
  @Post('/login')
  @HttpCode(200)
  async login(@Body() body: LoginUserDto) {
    const user = await this.userService.login(body);
    return {
      success: true,
      user: plainToInstance(User, user),
    };
  }

  @ApiCustomResponses([
    { status: 200, description: 'Kullanıcı bulundu', type: getUserDto },
    { status: 404, description: 'Kullanıcı bulunamadı', type: ErrorDto },
    { status: 500, description: 'Sunucu hatası', type: ErrorDto },
  ])
  @Get('/user/id/:id')
  async getUserById(@Param('id') id: number) {
    return await this.userService.getUserById(id);
  }

  @ApiCustomResponses([
    { status: 200, description: 'Kullanıcı bulundu', type: getUserDto },
    { status: 404, description: 'Kullanıcı bulunamadı', type: ErrorDto },
    { status: 500, description: 'Sunucu hatası', type: ErrorDto },
  ])
  @Get('/user/email/:email')
  async getUserByEmail(@Param('email') email: string) {
    return await this.userService.getUserByEmail(email);
  }

  @ApiCustomResponses([
    { status: 200, description: 'Kullanıcı bulundu', type: getUserDto },
    { status: 404, description: 'Kullanıcı bulunamadı', type: ErrorDto },
    { status: 500, description: 'Sunucu hatası', type: ErrorDto },
  ])
  @Get('/user/username/:username')
  async getUserByUserName(@Param('username') username: string) {
    return await this.userService.getUserByUserName(username);
  }

  @ApiCustomResponses([
    {
      status: 200,
      description: 'Kullanıcı bilgileri güncellendi',
      type: ErrorDto,
    },
    { status: 404, description: 'Kullanıcı bulunamadı', type: ErrorDto },
    { status: 500, description: 'Sunucu hatası', type: ErrorDto },
  ])
  @Patch('/user')
  async updateUser(@Req() req: Request, @Body() body: UpdateUserDto) {
    if (!req.headers['x-user-id'])
      throw new BadRequestException("Header's not found x-user-id");
    const userId = +req.headers['x-user-id'];
    await this.userService.updateUser(userId, body);
    return { success: true, message: 'User updated' };
  }

  @ApiCustomResponses([
    { status: 200, description: 'Avatar değiştirildi', type: UpdateAvatarDto },
    { status: 404, description: 'Kullanıcı bulunamadı', type: ErrorDto },
    { status: 500, description: 'Sunucu hatası', type: ErrorDto },
  ])
  @ApiConsumes('multipart/form-data')
  @ApiBody(AvatarApiBody)
  @Patch('/user/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUserAvatar(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!req.headers['x-user-id'])
      throw new BadRequestException("Header's not found x-user-id");
    const userId = +req.headers['x-user-id'];
    const res = await this.userService.updateAvatar(userId, file);
    return { success: true, avatar_url: res.url };
  }

  @ApiResponse({
    status: 200,
    description: 'Şifre değiştirildi',
    example: { success: true, message: 'Şifre değiştirildi' },
  })
  @ApiCustomResponses([
    { status: 404, description: 'Kullanıcı bulunamadı', type: ErrorDto },
    { status: 500, description: 'Sunucu hatası', type: ErrorDto },
  ])
  @Patch('/user/password')
  async updatePasword(@Req() req: Request, @Body() body: UpdatePasswordDto) {
    if (!req.headers['x-user-id'])
      throw new BadRequestException("Header's not found x-user-id");
    const userId = +req.headers['x-user-id'];
    return this.userService.updatePassword(userId, body);
  }

  @ApiResponse({
    status: 200,
    description: 'Kullanıcı silindi',
    example: { success: true, message: 'Kullanıcı silindi' },
  })
  @ApiCustomResponses([
    { status: 404, description: 'Kullanıcı bulunamadı', type: ErrorDto },
    { status: 500, description: 'Sunucu hatası', type: ErrorDto },
  ])
  @Delete('/user')
  async deleteUser(@Req() req: Request) {
    if (!req.headers['x-user-id'])
      throw new BadRequestException("Header's not found x-user-id");
    const userId = +req.headers['x-user-id'];
    return await this.userService.deleteUser(userId);
  }
}
