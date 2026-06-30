import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/models/env.model';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env>) => ({
        transport: {
          host: configService.get('EMAIL_HOST', { infer: true }),
          port: Number(configService.get('EMAIL_PORT', { infer: true })) || 587,
          secure: false,
          auth: {
            user: configService.get('EMAIL_USER', { infer: true }),
            pass: configService.get('EMAIL_PASS', { infer: true }),
          },
        },
        defaults: {
          from: `"Finance Flow" <${configService.get('EMAIL_HOST', { infer: true })}>`,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
