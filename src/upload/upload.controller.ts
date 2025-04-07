import {
    Controller,
    Post, Req,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { Request } from 'express';
import * as fs from "fs";

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'file' }
            ],
            {
                storage: diskStorage({
                    destination: (req, file, cb) => {
                        const sessionId = req.cookies.sessionId;  // Access userId
                        if (!sessionId) {
                            return cb(new Error('User has no no authenticated session'), '');
                        }

                        const userDirectory = join('./uploads', sessionId.toString());
                        fs.mkdirSync(userDirectory, { recursive: true });
                        cb(null, userDirectory);
                    },
                    filename: (req, file, cb) => {
                        // const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
                        const sessionId = req.cookies.sessionId;
                        const userDirectory = join('./uploads', sessionId.toString());

                        let baseName = file.originalname.replace(extname(file.originalname), '');
                        let extension = extname(file.originalname);
                        let fileName = `${baseName}${extension}`;
                        let counter = 1;

                        while (fs.existsSync(join(userDirectory, fileName))) {
                            fileName = `${baseName} (${counter})${extension}`;
                            counter++;
                        }

                        cb(null, fileName);
                    },
                }),
            }
        )
    )
    uploadFile(@UploadedFiles() files: { file?: Express.Multer.File[] }, @Req() req: Request) {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return { error: 'User has no no authenticated session' };
        }

        const response = files.file?.map(file => ({
            originalName: file.originalname,
            fileName: file.filename,
            size: file.size,
            link: `/uploads/${file.filename}`,
        }));

        return response;
    }
}
