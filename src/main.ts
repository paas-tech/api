import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { PrismaCatcherFilter } from './filters/prisma-catcher.filter';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });

  // enable cors
  app.enableCors({
    origin: process.env.APP_DEV_MODE ? 'http' : 'https' + '://' + process.env.FRONTEND_HOST,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // catch all prisma exceptions
  app.useGlobalFilters(new PrismaCatcherFilter());

  // use global interceptor
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('PaaSTech API')
    .setDescription('Client API for the PaaSTech project')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('projects')
    .addTag('ssh keys')
    .addCookieAuth('access')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // initialise cookie parser
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
