import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { SessionsModule } from './sessions/sessions.module';
import { UploadController } from "./upload/upload.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./files/file.entity";

@Module({
    imports: [
        FilesModule,
        SessionsModule,
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'app.db',
            entities: [FileEntity],
            synchronize: false,
        }),
        // TypeOrmModule.forFeature([FileEntity]),
    ],
    controllers: [UploadController],
})
export class AppModule {}