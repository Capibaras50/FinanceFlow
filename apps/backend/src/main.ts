import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.WEB_URL,
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, origin?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    allowedHeaders: ['content-type', 'authorization'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
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
