import {
    Controller,
    Req,
    Get, Param, Res, NotFoundException, Post,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { Response, Request } from 'express';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Get('my')
    async myFiles(@Req() req: Request) {
        const uploadDir = req.session.user?.uploadDir;
        if (!uploadDir) {
            return { error: 'User session is missing upload dir' };
        }

        return {
            // session_id: req.sessionID,
            files: await this.filesService.getUserFiles(req.sessionID, uploadDir)
        };
    }

    @Get('d/:token')
    async download(@Req() req: Request, @Param('token') token: string, @Res() res: Response) {
        const fileData = await this.filesService.getFileByToken(token);

        if (!fileData) {
            throw new NotFoundException('File not found or link has expired');
        }
        if (new Date() > fileData.expiresAt) {
            throw new NotFoundException('Download link has expired');
        }

        const uploadDir = req.session.user?.uploadDir;
        return res.sendFile(fileData.fileName, { root: './uploads/'+uploadDir });
    }

    @Post('remove/:fileId')
    async remove(@Param('fileId') fileIdParam: string, @Req() req: Request, @Res() res: Response) {
        if (req.session.user?.uploadDir) {
            const fileId = parseInt(fileIdParam);
            await this.filesService.removeFile(req.session.user.uploadDir, fileId);
            res.redirect('/');
        }
    }
}
