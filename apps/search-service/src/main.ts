import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/search');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.WEB_URL || 'http://localhost:3000' });
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`[search-service] NestJS listening on http://localhost:${port}/api/search`);
}
bootstrap();
