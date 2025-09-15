import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUserDto';
import { LoginUserDto } from './dto/loginUserDto';
import type{ Response } from 'express';


@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/register')
  async register(@Body() body: CreateUserDto) {
    return  await this.authService.register(body);
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() body: LoginUserDto, @Res() res: Response) {
    const result = await this.authService.login(body)
    if (!result) throw new Error('Login failed');
    const {refreshToken, accessToken, data} = result;
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.json({...data, accessToken,});
  }
}
