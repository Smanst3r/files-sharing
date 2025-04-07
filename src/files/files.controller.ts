import {
    Controller,
    Req,
    Get,
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
}
