import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Payload } from 'src/models/payload.model';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
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
}
