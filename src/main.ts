import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { AllExceptionsFilter } from './http.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: 'http://localhost:5173', // ✅ Cho phép FE truy cập
    credentials: true, // ✅ Nếu bạn dùng cookie / token
  }); // <- gắn filter
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
