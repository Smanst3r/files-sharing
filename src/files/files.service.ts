import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class FilesService {
    private tempLinks = new Map<string, { sessionId: string; filename: string }>();

    generateDownloadLink(sessionId: string, filename: string) {
        const token = randomUUID();
        this.tempLinks.set(token, { sessionId, filename });

        setTimeout(() => this.tempLinks.delete(token), 10 * 60 * 1000); // 10 min

        return { url: `/files/download/${token}` };
    }

    getFile(token: string, sessionId: string) {
        const data = this.tempLinks.get(token);
        if (!data || data.sessionId !== sessionId) return null;

        const filePath = path.resolve('uploads', data.filename);
        return fs.existsSync(filePath) ? filePath : null;
    }

    getUserFiles(sessionId: string) {
        const dir = path.resolve(`uploads/${sessionId}`);
        if (fs.existsSync(dir)) {
            return fs.readdirSync(dir);
        }
        return [];
    }
}
