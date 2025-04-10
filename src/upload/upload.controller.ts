import {
    Controller,
    Post, Req,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import * as fs from "fs";
import { FilesService } from "../files/files.service";

type TResponseFile = {
    fileName: string
    size: number
    link: string
}

@Controller('upload')
export class UploadController {
    constructor(private readonly filesService: FilesService) {}

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'file' }
            ],
            {
                storage: diskStorage({
                    destination: (req, file, cb) => {
                        const uploadDir = req.session.user?.uploadDir;
                        if (!uploadDir) {
                            return cb(new Error('User session is missing upload dir'), '');
                        }

                        const userDirectory = join('./uploads', uploadDir);
                        fs.mkdirSync(userDirectory, { recursive: true });
                        cb(null, userDirectory);
                    },
                    filename: (req, file, cb) => {
                        const baseName = file.originalname.replace(extname(file.originalname), '');
                        const extension = extname(file.originalname);
                        const fileName = `${baseName}${extension}`;
                        cb(null, fileName);
                    },
                }),
            }
        )
    )
    async uploadFile(@UploadedFiles() files: { file?: Express.Multer.File[] }, @Req() req: Request) {
        const sessionId = req.sessionID;
        const response: { statusCode: number, files: TResponseFile[] } = {
            statusCode: 200,
            files: [],
        };

        if (files?.file) {
            for (const file of files.file) {
                const downloadFileToken = await this.filesService.saveFile(file.filename, sessionId);

                response.files.push({
                    fileName: file.filename,
                    size: file.size,
                    link: `/files/d/${downloadFileToken}`,
                });
            }
        }

        return response;
    }
}
