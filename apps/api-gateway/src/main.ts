import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import proxy from 'express-http-proxy';
import { jwtMiddleware } from './middlewares/jwt.middleware.ts.middleware';
import unless from 'express-unless';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    (jwtMiddleware as any).unless({
      path: ['/auth/login', '/auth/register', /^\/auth\/docs/, /^\/user\/docs/],
    }),
  );
  app.use(
    '/auth',
    proxy(process.env.AUTH_SERVICE_URL || 'http://localhost:3001'),
  );

  app.use(
    '/user',
    proxy(process.env.USER_SERVICE_URL || 'http://localhost:3002'),
  );
  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 API Gateway running on http://localhost:3000');
}
bootstrap();
