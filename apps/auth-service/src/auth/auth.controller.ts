import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { CreateUSerDto } from './dto/createUserDto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // @Post('/register')
  // register(@Body() body: CreateUSerDto) {
  //   try {
  //     const result = this.authService.register(body);
  //   } catch (error) {}
  // }
}
