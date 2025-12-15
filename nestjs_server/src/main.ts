import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Mamoon Project API')
    .setDescription('Camera, Motion, and Movement Control API')
    .setVersion('1.0')
    .addTag('camera', 'Camera related endpoints')
    .addTag('motion', 'Motion detection endpoints')
    .addTag('movement', 'Servo motor movement endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000, '0.0.0.0');
  var appUrl = await app.getUrl();
  console.log(`Application is running on: ${appUrl}`);
  console.log(`Swagger API Documentation: ${appUrl}/api`);
}
bootstrap();