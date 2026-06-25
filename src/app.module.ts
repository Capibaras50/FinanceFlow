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
    UsersModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
    WalletsModule,
  ],
})
export class AppModule {}
