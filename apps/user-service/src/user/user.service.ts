import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateUserDto } from './dto/createUserDto';
import { compareHashedValue, hashingValue } from './utils/hash.utils';
import { LoginUserDto } from './dto/loginUserDto';
import { plainToInstance } from 'class-transformer';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private readonly dataSource: DataSource,
  ) {}
  r2 = new S3({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY!,
      secretAccessKey: process.env.R2_SECRET_KEY!,
    },
  });
  async register(body: CreateUserDto) {
    const userName = await this.userRepo.findOneBy({ username: body.username });
    if (userName) throw new ConflictException('Bu kullanıcı adı kullanılmakta');
    const email = await this.userRepo.findOneBy({ email: body.email });
    if (email) throw new ConflictException('Bu email kullanılmakta');
    if (body.password) {
      const hashedPass = await hashingValue(body.password);
      body.password = hashedPass;
    }
    const res = await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        username: body.username,
        email: body.email,
        password: body.password,
      });
      await manager.save(User, user);
      const profile = manager.create(Profile, {
        ...body.profile,
        user: user,
      });
      await manager.insert(Profile, profile);
      return {
        success: true,
        message: 'User successfully created',
        userId: user.id,
      };
    });
    return res;
  }

  async login(body: LoginUserDto) {
    if (!body.username && !body.email)
      throw new BadRequestException('Kullanıcı adı veya email zorunlu');
    const user = await this.userRepo.findOne({
      where: body.email ? { email: body.email } : { username: body.username },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('User not found');
    const checkPass = await compareHashedValue(body.password, user.password);
    if (!checkPass)
      throw new UnauthorizedException('Geçersiz şifre veya kullanıcı');
    return user;
  }

  async getUserById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('User not found');
    plainToInstance(User, user);
    return { success: true, user: plainToInstance(User, user) };
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('User not found');
    plainToInstance(User, user);
    return { success: true, user: plainToInstance(User, user) };
  }

  async getUserByUserName(userName: string) {
    const user = await this.userRepo.findOne({
      where: { username: userName },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('User not found');
    plainToInstance(User, user);
    return { success: true, user: plainToInstance(User, user) };
  }

  async deleteUser(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.profile) {
      await this.profileRepo.softDelete(user.profile.id);
    }
    return await this.userRepo.softDelete(user.id);
  }

  async updateUser(id: number, body: UpdateUserDto) {
    const { profile, ...userFields } = body;

    if (Object.keys(userFields).length > 0) {
      await this.userRepo.update(id, userFields);
    }
    if (profile && Object.keys(profile).length > 0) {
      const nowProfile = await this.profileRepo.findOne({
        where: { user: { id } },
      });
      await this.profileRepo.update(nowProfile!.id, profile);
    }
  }

  async updateAvatar(id: number, file: Express.Multer.File) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const filename =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof file.filename === 'string' ? file.filename : 'avatar';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const fileName = `user-${id}-${Date.now()}-${filename.replace(/\s+/g, '_')}`;
    const object = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      Body: file.buffer,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      ContentType: file.mimetype,
    });
    await this.r2.send(object);
    const url = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    const nowProfile = await this.profileRepo.findOne({
      where: { user: { id } },
    });
    return {
      row: await this.profileRepo.update(nowProfile!.id, { avatar_url: url }),
      url,
    };
  }

  async updatePassword(id: number, body: any) {
    const { oldPass, newPass } = body as { oldPass: string; newPass: string };
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    const checkPass = await compareHashedValue(oldPass, user.password);
    if (!checkPass) throw new UnauthorizedException('Invalid password');
    const hashPass = await hashingValue(newPass);
    return await this.userRepo.update(id, { password: hashPass });
  }
}
