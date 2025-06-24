import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { AllExceptionsFilter } from './http.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter()); // <- gắn filter
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
