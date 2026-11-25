import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  const config = new DocumentBuilder()
    .addGlobalResponse({
      status: 500,
      description: 'Internal Server Error',
    })
    .addBearerAuth()
    .addCookieAuth('accessToken')
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://google.com',
            tokenUrl: 'https://googleapis.com',
            scopes: {
              email: 'Acceso al correo electrónico',
              profile: 'Acceso al perfil básico',
            },
          },
        },
      },
      'google',
    )
    .setTitle('Finance Flow API')
    .setDescription(
      'The API have different endpoints for get, create, update and delete expenses, earnings, wallets and categories and you can use AI for manage your finances',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api', app, documentFactory, {
      jsonDocumentUrl: 'api/json',
    });
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(`NestJs esta corriendo en el puerto ${process.env.PORT || 3000}`);
}
void bootstrap();
