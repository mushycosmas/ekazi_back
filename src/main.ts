
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // Global API prefix
  app.setGlobalPrefix('api');
      app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
  const port = process.env.PORT || 3011; // <--- use env or 3011 by default
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();