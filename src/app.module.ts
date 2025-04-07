import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { SessionsModule } from './sessions/sessions.module';
import { UploadController } from "./upload/upload.controller";

@Module({
    imports: [FilesModule, SessionsModule],
    controllers: [UploadController],
})
export class AppModule {}