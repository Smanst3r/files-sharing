import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './file.entity';
import { randomUUID } from "crypto";

@Injectable()
export class FilesRepository {
    constructor(
        @InjectRepository(FileEntity)
        private readonly repo: Repository<FileEntity>,
    ) {}

    async saveFileInDb(fileName: string, sessionId: string): Promise<string> {
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expire after 1 day

        const existingFile = await this.repo.findOne({
            where: {
                fileName,
                sessionId,
            },
        });
        if (existingFile) {
            existingFile.expiresAt = expiresAt;
            await this.repo.save(existingFile);
            return existingFile.token;
        }

        const file = this.repo.create({
            sessionId,
            token,
            fileName,
            expiresAt,
        });
        await this.repo.save(file);
        return token;
    }

    async findFileByToken(token: string): Promise<FileEntity | null> {
        return this.repo.findOne({ where: { token } });
    }
}
