import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'node:path';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMessage(
    to: string,
    message: string,
    subject: string,
    html?: string,
    from?: string,
  ) {
    try {
      const options = {
        to,
        subject,
        text: message,
        attachments: [
          {
            filename: 'logo.png',
            path: join(process.cwd(), 'assets', 'images', 'logo.png'),
            cid: 'financeflow-logo',
          },
        ],
      };
      if (from) {
        options['from'] = from;
      }
      if (html) {
        options['html'] = html;
      }
      await this.mailerService.sendMail(options);
      return { message: 'The Email Sent Successfully' };
    } catch {
      throw new BadRequestException('The Mail Couldnt Be Sent');
    }
  }
}
