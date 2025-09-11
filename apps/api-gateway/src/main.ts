import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import proxy from 'express-http-proxy';
import { jwtMiddleware } from './middlewares/jwt.middleware.ts.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(jwtMiddleware);

  app.use(
    '/auth',
    proxy(process.env.AUTH_SERVICE_URL || 'http://localhost:3001'),
  );
  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 API Gateway running on http://localhost:3000');
}
bootstrap();
