import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { FilesRepository } from "./files.repository";

@Injectable()
export class FilesService {

    constructor(private readonly filesRepository: FilesRepository) {}

    async saveFile(fileName: string, sessionId: string): Promise<string> {
        return this.filesRepository.saveFileInDb(fileName, sessionId);
    }

    async getFileByToken(token: string) {
        return this.filesRepository.findFileByToken(token);
    }

    getUserFiles(sessionId: string) {
        const dir = path.resolve(`uploads/${sessionId}`);
        if (fs.existsSync(dir)) {
            return fs.readdirSync(dir);
        }
        return [];
    }
}
