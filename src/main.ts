// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
// import { join } from 'path';
// import { NestExpressApplication } from '@nestjs/platform-express';

// async function bootstrap() {

//   const app = await NestFactory.create<NestExpressApplication>(AppModule);
//   // const app = await NestFactory.create(AppModule);

//   // Global API prefix
//   app.setGlobalPrefix('api');

//   // ✅ CORS ENABLED
//   app.enableCors({
//     origin: '*', // change to frontend URL in production
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
//   });

//   // ✅ MAKE uploads FOLDER PUBLIC
//   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//     prefix: '/uploads/',
//   });

//   // Global validation pipe
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     }),
//   );

//   const port = process.env.PORT || 3011;

//   await app.listen(port);
//   console.log(`Server running on port ${port}`);
// }

// bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {

  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );


  app.setGlobalPrefix('api');


app.enableCors({
  origin: [
    'https://recruitment.ekazi.co.tz',
    'https://ekazi.co.tz',
    'http://localhost:3000',
  ],
  methods: [
    'GET',
    'HEAD',
    'PUT',
    'PATCH',
    'POST',
    'DELETE',
    'OPTIONS',
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
  ],
  credentials: true,
});



  app.useStaticAssets(
    join(__dirname, '..', 'uploads'),
    {
      prefix: '/uploads/',
    },
  );



  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );


  const port =
    process.env.PORT || 3011;


  await app.listen(port);


  console.log(
    `Server running on port ${port}`,
  );

}

bootstrap();