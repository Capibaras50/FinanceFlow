import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';

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
