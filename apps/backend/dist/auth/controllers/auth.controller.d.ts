import express from 'express';
import { AuthService } from '../services/auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: express.Request): {
        accessToken: string;
    };
}
