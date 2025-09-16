import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const port = process.env.PORT ?? 3001;
  const app = await NestFactory.create(AuthModule);

  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(port);
  console.log(`🚀 AUTH SERVICE running on http://localhost:${port}`);
}
void bootstrap();
