import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid'

@Controller('auth')
export class AuthController {
    constructor(private config: ConfigService) {}

    @Get()
    tokenForm(@Req() req: Request, @Res() res: Response) {
        res.render('auth-form');
    }

    @Post()
    async handleTokenForm(@Body('token') token: string, @Req() req: Request, @Res() res: Response) {
        const tokenFilePath: string = this.config.get('TOKENS_FILE_PATH', '');
        const tokens = fs.readFileSync(tokenFilePath, 'utf-8')
            .split('\n')
            .map(t => t.trim());

        if (tokens.includes(token)) {
            req.session.user = {
                authenticated: true,
                uploadDir: nanoid(12),
            };
            return res.redirect('/');
        } else {
            // return res.redirect('/auth');
            res.render('auth-form', {
                validationError: 'Invalid token, please contact developer to get valid token',
            });
        }
    }
}
