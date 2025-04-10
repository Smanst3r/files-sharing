import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './file.entity';
import { nanoid } from "nanoid";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FilesRepository {
    constructor(
        @InjectRepository(FileEntity)
        private readonly repo: Repository<FileEntity>,
        private config: ConfigService
    ) {}

    async saveFileInDb(fileName: string, sessionId: string): Promise<string> {
        const token = nanoid(12);
        const tokenLifetimeDays = parseInt(this.config.get('DOWNLOAD_TOKEN_LIFETIME_DAYS', '1'));

        const expiresAt = new Date(Date.now() + tokenLifetimeDays * 24 * 60 * 60 * 1000);
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

    async findOneBy(where: FindOptionsWhere<FileEntity>): Promise<FileEntity|null> {
        return this.repo.findOne({ where: { ...where } });
    }

    async remove(fileId: number) {
        const fileToDelete = await this.repo.findOne({ where: { id: fileId } });
        if (fileToDelete) {
            await this.repo.remove(fileToDelete);
        }
    }
}
