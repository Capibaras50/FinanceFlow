import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import crypto from 'node:crypto';
import { MailService } from 'src/mail/services/mail.service';
import { Payload } from 'src/models/payload.model';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    return user;
  }

  login(payload: Payload) {
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async recoveryPassword(mail: string) {
    const user = await this.usersService.findUserByEmail(mail);
    if (!user) {
      return { message: 'Email Sent Successfully' };
    }
    const { recoveryToken, hashRecoveryToken } = this.generateRecoveryToken();
    await this.usersService.saveRecoveryToken(user.id, hashRecoveryToken);
    const linkChangePassword = `${this.configService.get('RECOVERY_PASSWORD_URL', { infer: true }) || 'http://localhost:3001/auth/reset-password'}?token=${recoveryToken}`;
    const htmlMail = this.generateHtmlEmail(
      user.profile.name,
      linkChangePassword,
    );
    const messageMail = this.generateTextEmail(
      user.profile.name,
      linkChangePassword,
    );
    await this.mailService.sendMessage(
      mail,
      messageMail,
      'Reset your Finance Flow password',
      htmlMail,
    );
    return { message: 'Email Sent Successfully' };
  }

  async changePassword(recoveryToken: string, newPassword: string) {
    const hashRecoveryToken = crypto
      .createHash('sha256')
      .update(recoveryToken)
      .digest('hex');
    const user =
      await this.usersService.findUserByRecoveryToken(hashRecoveryToken);
    if (new Date() > user.recoveryTokenExpiresAt) {
      throw new UnauthorizedException('Invalid Recovery Token');
    }
    const hashPassword = await hash(newPassword, 10);
    await this.usersService.recoveryPassword(user.id, hashPassword);
    return { message: 'The Password was changed successfully' };
  }

  private generateHtmlEmail(name: string, linkChangePassword: string) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <title>Reset Password</title>
      </head>

      <body style="
          margin:0;
          padding:40px;
          background:#0F172A;
          font-family:Arial, Helvetica, sans-serif;
      ">

      <table
          align="center"
          cellpadding="0"
          cellspacing="0"
          width="600"
          style="
              background:#ffffff;
              border-radius:16px;
              overflow:hidden;
          "
      >

      <tr>
      <td
          align="center"
          style="
              padding:40px 30px 20px;
              background:#0F172A;
          "
      >

      <img
        src="cid:financeflow-logo"
        alt="Finance Flow"
        width="140"
      />

      </td>
      </tr>

      <tr>
      <td style="padding:40px; color:#1F2937;">

      <h1 style="
      margin:0;
      font-size:28px;
      font-weight:bold;
      ">
      Reset your password
      </h1>

      <p style="
      font-size:16px;
      line-height:28px;
      margin-top:24px;
      ">
      Hello <strong>${name}</strong>,
      </p>

      <p style="
      font-size:16px;
      line-height:28px;
      ">
      We received a request to reset the password for your
      <strong>Finance Flow</strong> account.
      </p>

      <p style="
      font-size:16px;
      line-height:28px;
      ">
      Click the button below to create a new password.
      </p>

      <div style="text-align:center; margin:40px 0;">

      <a
      href="${linkChangePassword}"
      style="
      background:#6D28D9;
      color:white;
      padding:16px 34px;
      border-radius:10px;
      text-decoration:none;
      font-weight:bold;
      display:inline-block;
      "
      >
      Reset Password
      </a>

      </div>

      <p style="
      font-size:15px;
      line-height:26px;
      ">
      This link will expire in <strong>15 minutes</strong>.
      </p>

      <p style="
      font-size:15px;
      line-height:26px;
      ">
      If you didn't request a password reset, you can safely ignore this email.
      Your password won't be changed.
      </p>

      <hr style="
      margin:40px 0;
      border:none;
      border-top:1px solid #E5E7EB;
      ">

      <p style="
      font-size:13px;
      color:#6B7280;
      line-height:22px;
      ">

      If the button doesn't work, copy and paste the following link into your browser:

      <br><br>

      <a href="${linkChangePassword}">
      ${linkChangePassword}
      </a>

      </p>

      </td>
      </tr>

      <tr>
      <td
      align="center"
      style="
      padding:25px;
      background:#F8FAFC;
      color:#6B7280;
      font-size:13px;
      "
      >

      © ${new Date().getFullYear()} Finance Flow. All rights reserved.

      </td>
      </tr>

      </table>

      </body>
      </html>
      `;
  }

  private generateRecoveryToken() {
    const recoveryToken = crypto.randomBytes(32).toString('hex');
    const hashRecoveryToken = crypto
      .createHash('sha256')
      .update(recoveryToken)
      .digest('hex');
    return {
      recoveryToken,
      hashRecoveryToken,
    };
  }

  private generateTextEmail(name: string, linkChangePassword: string) {
    return `
      Hello ${name},

      We received a request to reset the password for your Finance Flow account.

      Open the following link to create a new password:

      ${linkChangePassword}

      This link will expire in 15 minutes.

      If you didn't request this, simply ignore this email.

      Finance Flow Team
      `;
  }
}
