import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUserDto';
import { LoginUserDto } from './dto/loginUserDto';
import type { Response } from 'express';
import { reqFromFindUser } from './utils/utils';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    return await this.authService.register(body);
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() body: LoginUserDto, @Res() res: Response) {
    const result = await this.authService.login(body);
    if (!result) throw new Error('Login failed');
    const { refreshToken, accessToken, data } = result;
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ ...data, accessToken });
  }

  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const userId = reqFromFindUser(req);
    if (!(req as any).cookies['refresh_token'])
      return res.json({ success: false, message: 'Already exited' });
    await this.authService.updateRefreshToken(userId, '');
    res.clearCookie('refresh_token', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return res.json({ success: true, message: 'The exit has been made.' });
  }

  @Get('/refresh_token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const userId = reqFromFindUser(req);
    const refresh = (req as any).cookies['refresh_token'];
    const result = await this.authService.refreshToken(userId, refresh);
    if (!result) throw new BadRequestException();
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true, accessToken: result.accessToken });
  }

  @Post('/twofa_setup')
  async twoFaSetup(@Req() req: Request) {
    const userId = reqFromFindUser(req);
    if (!req.headers['x-user-email'])
      throw new BadRequestException("Header's not found x-user-email");
    const email = req.headers['x-user-email'];
    return await this.authService.twoFaSetup(userId, email);
  }

  @Post('/twofa_enable')
  async twoFaEnable(@Req() req: Request, @Body('token') token: string) {
    const userId = reqFromFindUser(req);
    if (!token) throw new BadRequestException('Token required');
    return await this.authService.twoFaEnable(userId, token);
  }
}
