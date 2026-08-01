import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [process.env.WEB_URL ?? ''].filter(Boolean)
        : true,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()));
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
  console.log(`NestJs esta corriendo en el puerto ${process.env.PORT || 3000}`);
}
void bootstrap();
