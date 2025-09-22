import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Res,
  UnauthorizedException,
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
import { compareHashedValue, hashingValue } from './utils/hash.utils';
import type { Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
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
      const auth = await this.authRepo.findOneBy({ user_id: payload.id });
      if (auth && auth.twofa_enable) {
        if (!body.token) {
          throw new HttpException(
            { success: false, message: '2FA token required' },
            401,
          );
        }
        const isValid = speakeasy.totp.verify({
          secret: auth.twofa_secret,
          encoding: 'base32',
          token: body.token,
          window: 1,
        });
        if (!isValid)
          throw new HttpException(
            { success: false, message: '2FA token invalid' },
            401,
          );
      }
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
    } else {
      await this.refreshRepo.update({ user_id: id }, { token: hashRefresh });
    }
  }

  async refreshToken(id: number, refresh: string) {
    const refreshRecord = await this.refreshRepo.findOneByOrFail({
      user_id: id,
    });
    const isValid = compareHashedValue(refresh, refreshRecord.token);
    if (!isValid) throw new UnauthorizedException('Tokens do not match');
    try {
      const data = await firstValueFrom(
        this.httpService.get(this.userService + `/user/id/${id}`),
      );
      const payload: any = { id, email: data.data.user.email };
      const { accessToken, refreshToken } = generateToken(payload);
      await this.updateRefreshToken(payload.id, refreshToken);
      return { accessToken, refreshToken };
    } catch (error) {
      catchErrorFunction(error);
    }
  }

  async twoFaSetup(id: number, email: string) {
    const secret = speakeasy.generateSecret({
      name: `NestPinpon: ${email}`,
      issuer: 'NestPinpon',
      length: 32,
    });
    const res = await this.authRepo.update(
      { user_id: id },
      { twofa_secret: secret.base32 },
    );
    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');
    return { success: true, qr: qrDataUrl };
  }

  async twoFaEnable(id: number, token: string) {
    const auth = await this.authRepo.findOneByOrFail({ user_id: id });
    if (!auth.twofa_secret)
      throw new BadRequestException('Two Factor has not been created');
    const verified = speakeasy.totp.verify({
      secret: auth.twofa_secret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified)
      throw new UnauthorizedException('Token is invalid or deleted');
    try {
      const data = await firstValueFrom(
        this.httpService.patch(
          this.userService + '/user',
          {
            is_2fa_enabled: true,
          },
          { headers: { 'x-user-id': id } },
        ),
      );
      await this.authRepo.update({ user_id: id }, { twofa_enable: true });
      return { success: true, message: '2FA enabled' };
    } catch (error) {
      catchErrorFunction(error);
    }
  }

  async twoFaDisable(id: number, token: string) {
    const auth = await this.authRepo.findOneByOrFail({ user_id: id });
    if (!auth.twofa_enable) {
      throw new HttpException(
        { success: false, message: 'Two factor inactive' },
        400,
      );
    }
    const verified = speakeasy.totp.verify({
      secret: auth.twofa_secret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified)
      throw new UnauthorizedException('Token is invalid or deleted');
    try {
      const data = await firstValueFrom(
        this.httpService.patch(
          this.userService + `/user`,
          {
            is_2fa_enabled: false,
          },
          { headers: { 'x-user-id': id } },
        ),
      );
      await this.authRepo.update({ user_id: id }, { twofa_enable: false });
      return {
        success: true,
        message: 'Two-factor authentication has been disabled',
      };
    } catch (error) {
      catchErrorFunction(error);
    }
  }
}
