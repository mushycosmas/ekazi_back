
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // Global API prefix
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 3011; // <--- use env or 3011 by default
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();