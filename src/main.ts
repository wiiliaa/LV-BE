import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  const config = new DocumentBuilder()
    .setTitle('DaDi')
    .setDescription('API DaDi')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  await app.listen(3456);
}
bootstrap();
