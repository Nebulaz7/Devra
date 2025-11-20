import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CRITICAL: Enable JSON body parser with increased limit
  app.enableCors({
    origin: ['http://localhost:3000'], // Add your frontend URLs
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Devra API')
    .setDescription('Dataset NFT Platform API')
    .setVersion('1.0')
    .addTag('datasets')
    .addTag('blockchain')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(5000);
  console.log('🚀 Server running on http://localhost:5000');
  console.log('📚 API Docs available at http://localhost:5000/api');
}
bootstrap();
