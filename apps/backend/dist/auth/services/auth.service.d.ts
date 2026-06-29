import { JwtService } from '@nestjs/jwt';
import { Payload } from "../../models/payload.model";
import { UsersService } from "../../users/services/users.service";
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<import("../../users/entities/user.entity").User>;
    login(payload: Payload): {
        accessToken: string;
    };
}
