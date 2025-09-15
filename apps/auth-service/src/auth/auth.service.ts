import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthTable } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUserDto';
import { firstValueFrom, generate } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { LoginUserDto } from './dto/loginUserDto';
import { catchErrorFunction } from './utils/catchError';
import { generateToken } from './utils/generate.token';
import { RefreshToken } from './entities/refresh_tokens.entity';
import { hashingValue } from './utils/hash.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthTable)
    private readonly authRepo: Repository<AuthTable>,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
    private readonly httpService: HttpService,
  ) {}

  userService = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  DEFAULT_AVATAR = process.env.R2_PUBLIC_URL + '/default-profile.png';
  headers = {
    headers: {
      'x-internal-key': process.env.INTERNAL_API_KEY,
    },
  };
  async register(body: CreateUserDto) {
    if (!body.profile) body.profile = { avatar_url: this.DEFAULT_AVATAR };
    else body.profile.avatar_url = this.DEFAULT_AVATAR;
    try {
      const res = await firstValueFrom(
        this.httpService.post(
          this.userService + '/register',
          body,
          this.headers,
        ),
      );
      const user = this.authRepo.create({ user_id: res.data.userId as number });
      await this.authRepo.save(user);
      return res.data;
    } catch (error) {
      console.error(error);
      return catchErrorFunction(error);
    }
  }

  async login(body: LoginUserDto) {
    try {
      const res = await firstValueFrom(
        this.httpService.post(this.userService + '/login', body, this.headers),
      );
      const payload: any = {
        id: res.data.user.id,
        username: res.data.user.username,
        email: res.data.user.email,
      };
      const { accessToken, refreshToken } = generateToken(payload);
      await this.updateRefreshToken(payload.id, refreshToken);
      return { success: true, accessToken, refreshToken, data: res.data };
    } catch (error) {
      return catchErrorFunction(error);
    }
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    let hashRefresh = '';
    const auth = await this.authRepo.findOneBy({ user_id: id });
    const refreshRecord = await this.refreshRepo.findOneBy({ user_id: id });
    if (refreshToken !== '') hashRefresh = await hashingValue(refreshToken);    
    if (!refreshRecord) {
      const refresh = this.refreshRepo.create({
        user_id: id,
        user: auth!,
        token: hashRefresh,
      });
      await this.refreshRepo.save(refresh);
    }else{
      await this.refreshRepo.update({user_id: id}, {token: hashRefresh})
    }
  }
}
