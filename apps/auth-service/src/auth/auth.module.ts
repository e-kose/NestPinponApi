import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import dbConfig from './config/db.config';
import { AuthTable } from './entities/auth.entity';
import { RefreshToken } from './entities/refresh_tokens.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({ useFactory: dbConfig }),
    TypeOrmModule.forFeature([AuthTable, RefreshToken]),
    HttpModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
