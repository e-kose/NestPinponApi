import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dbConfig from './config/db.config';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({ useFactory: dbConfig }),
    TypeOrmModule.forFeature([User, Profile]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
