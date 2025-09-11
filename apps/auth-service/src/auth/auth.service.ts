import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthTable } from './entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthTable)
    private readonly authRepo: Repository<AuthTable>,
  ) {}
}
