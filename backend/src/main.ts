import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('ThoughtCloud')
      .setDescription('Content service for Chain Of Thought')
      .setVersion('1.0')
      .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: "openapi.json"
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
