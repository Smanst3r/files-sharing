import { Controller, Get, Res, Req, Render, Post, Body } from '@nestjs/common';
import { Response, Request } from 'express';
import { FilesService } from "./files/files.service";
import { FilesRepository } from "./files/files.repository";
import { ConfigService } from "@nestjs/config";
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
    constructor(private readonly filesService: FilesService,
                private readonly filesRepository: FilesRepository,
                private config: ConfigService) {}

    @Get()
    @Render('index')
    async home(@Req() req: Request) {
        const userUploadDir = req.session.user?.uploadDir;
        const sessionId = req.sessionID;

        if (!userUploadDir) {
            return { files: [] };
        }

        const files = await this.filesService.getUserFiles(sessionId, userUploadDir);
        const allowedIpsFilePath = this.config.get('ALLOWED_IPS_FILE_PATH', '');
        const allowedIps = fs.readFileSync(path.resolve(allowedIpsFilePath), 'utf-8')
            .split(/\r?\n/)
            .map((line: string) => line.trim())
            .filter(Boolean);
        const tokensFilePath = this.config.get('TOKENS_FILE_PATH', '');
        const accessTokens = fs.readFileSync(tokensFilePath, 'utf-8')
            .split(/\r?\n/)
            .map((line: string) => line.trim())
            .filter(Boolean);

        return {
            filesDaysLifetime: this.config.get('UPLOADED_FILES_LIFETIME_DAYS'),
            files,
            allowedIps,
            accessTokens,
        };
    }

    @Post('save-website-settings')
    async saveWebsiteSettings(
        @Body('allowed_ip_addresses') ipAddressesRaw: string,
        @Body('access_tokens') accessTokensRaw: string,
        @Res() res: Response
    ) {
        const allowedIpsFilePath = this.config.get('ALLOWED_IPS_FILE_PATH', '');
        const tokensFilePath = this.config.get('TOKENS_FILE_PATH', '');

        const ipAddresses = ipAddressesRaw
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);

        const accessTokens = accessTokensRaw
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);

        fs.writeFileSync(path.resolve(allowedIpsFilePath), ipAddresses.join('\n'));
        fs.writeFileSync(path.resolve(tokensFilePath), accessTokens.join('\n'));
        res.redirect('/');
    }
}