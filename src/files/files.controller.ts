import {
    Controller,
    Req,
    Get, Param, Res, NotFoundException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { Response, Request } from 'express';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Get('my')
    myFiles(@Req() req: Request) {
        const sessionId = req.cookies?.sessionId;
        if (!sessionId) {
            return { error: 'User has no no authenticated session' };
        }

        return {
            session_id: sessionId,
            files: this.filesService.getUserFiles(sessionId)
        };
    }

    @Get('download/:token')
    async download(@Param('token') token: string, @Res() res: Response) {
        const fileData = await this.filesService.getFileByToken(token);

        if (!fileData) {
            throw new NotFoundException('File not found or link has expired');
        }
        if (new Date() > fileData.expiresAt) {
            throw new NotFoundException('Download link has expired');
        }

        // return res.sendFile(join('./uploads', fileData.sessionId, fileData.fileName));
        return res.sendFile(fileData.fileName, { root: './uploads/'+fileData.sessionId });
    }
}
