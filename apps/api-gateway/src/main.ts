import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import proxy from 'express-http-proxy';
import { jwtMiddleware } from './middlewares/jwt.middleware.ts.middleware';
import cookieParser from 'cookie-parser';
import { refreshToken } from './middlewares/refresh.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(refreshToken);
  app.use(
    (jwtMiddleware as any).unless({
      path: [
        '/auth/refresh_token',
        '/auth/login',
        '/auth/register',
        /^\/auth\/docs/,
        /^\/user\/docs/,
        '/user/login',
        '/user/register',
      ],
    }),
  );
  app.use(
    '/auth',
    proxy(process.env.AUTH_SERVICE_URL || 'http://localhost:3001', {
      parseReqBody: false,
    }),
  );

  app.use(
    '/user',
    proxy(process.env.USER_SERVICE_URL || 'http://localhost:3002', {
      parseReqBody: false,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 API Gateway running on http://localhost:3000');
}
bootstrap();
