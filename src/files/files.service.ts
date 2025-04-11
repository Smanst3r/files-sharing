import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { FilesRepository } from "./files.repository";
import { ConfigService } from "@nestjs/config";
import { formatFileSize } from "../utils";

@Injectable()
export class FilesService {

    constructor(private readonly filesRepository: FilesRepository, private config: ConfigService) {}

    async saveFile(fileName: string, sessionId: string): Promise<string> {
        return this.filesRepository.saveFileInDb(fileName, sessionId);
    }

    async getFileByToken(token: string) {
        return this.filesRepository.findFileByToken(token);
    }

    async removeFile(uploadDir: string, fileId: number) {
        const fileData = await this.filesRepository.findOneBy({ id: fileId });
        if (fileData) {
            const filePath = path.resolve(`uploads/${uploadDir}/${fileData.fileName}`);
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        throw new Error('Error deleting file');
                    }
                });
            }
            await this.filesRepository.remove(fileId);
        }
        return true;
    }

    async getUserFiles(sessionId: string, uploadDir: string) {
        const dir = path.resolve(`uploads/${uploadDir}`);
        const uploadedFilesTtl = parseInt(this.config.get('UPLOADED_FILES_LIFETIME_DAYS', '0'));

        if (fs.existsSync(dir)) {
            const fsFiles = fs.readdirSync(dir).map((filename) => {
                const filePath = path.join(dir, filename);
                const stats = fs.statSync(filePath);
                const mtime = stats.mtime;

                const fileStat: TFileStat & Partial<TUploadedFile> = {
                    name: filename,
                    size: stats.size,
                    mtime: mtime,
                    ctime: stats.ctime,
                    isFile: stats.isFile(),
                    isDirectory: stats.isDirectory(),
                    sizeFormatted: formatFileSize(stats.size),
                };
                if (uploadedFilesTtl) {
                    fileStat.dateOfRemoval = new Date(mtime.getTime() + uploadedFilesTtl * 24 * 60 * 60 * 1000);
                }

                return fileStat;
            });

            // Sort desc by mtime
            fsFiles.sort((file1, file2) => file2.mtime.getTime() - file1.mtime.getTime());

            return await Promise.all(
                fsFiles.map(async (file) => {
                    const fileTokenData = await this.filesRepository.findOneBy({
                        fileName: file.name,
                        sessionId: sessionId,
                    });

                    if (fileTokenData) {
                        file.id = fileTokenData.id;
                        file.token = fileTokenData.token;
                        file.tokenExpiresAt = fileTokenData.expiresAt;
                        file.tokenIsExpired = new Date() > fileTokenData.expiresAt;
                    }
                    return file;
                })
            );
        }
        return [];
    }
}
