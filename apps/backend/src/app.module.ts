import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env } from './models/env.model';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WalletsModule } from './wallets/wallets.module';
import { BullModule } from '@nestjs/bullmq';
import { FinancialToolsModule } from './financial-tools/financial-tools.module';
import { ChatModule } from './chat/chat.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env>) => ({
        port: configService.get('PORT_DB', { infer: true }),
        username: configService.get('USER_DB', { infer: true }),
        password: configService.get('PASSWORD_DB', { infer: true }),
        database: configService.get('NAME_DB', { infer: true }),
        host: configService.get('HOST_DB', { infer: true }),
        type: 'postgres',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env>) => ({
        connection: {
          host: configService.get('HOST_QUEUE', { infer: true }),
          port: configService.get('PORT_QUEUE', { infer: true }),
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    UsersModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
    WalletsModule,
    FinancialToolsModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
