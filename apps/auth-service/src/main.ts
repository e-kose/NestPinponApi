import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const port = process.env.PORT ?? 3001;
  const app = await NestFactory.create(AuthModule);

  const config = new DocumentBuilder()
    .setTitle('Auth Service Document')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);
  
  app.use(cookieParser());
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
