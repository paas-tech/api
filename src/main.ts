import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { PrismaCatcherFilter } from './filters/prisma-catcher.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });

  // enable cors
  app.enableCors({
    origin: 'https://' + process.env.FRONTEND_HOST,
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // catch all prisma exceptions
  app.useGlobalFilters(new PrismaCatcherFilter());

  const config = new DocumentBuilder()
    .setTitle('PaaSTech API')
    .setDescription('Client API for the PaaSTech project')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('projects')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  // initialise cookie parser
  app.use(cookieParser())

  await app.listen(3000);
}
bootstrap();
