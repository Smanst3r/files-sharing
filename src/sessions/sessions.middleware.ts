import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionsMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (!req.cookies?.sessionId) {
            res.cookie('sessionId', randomUUID(), {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            });
        }
        next();
    }
}
