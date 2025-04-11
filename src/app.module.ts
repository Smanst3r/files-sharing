import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { UploadController } from "./upload/upload.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./files/file.entity";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth/auth.controller";
import { AppController } from "./app.controller";
import { CleanupModule } from './cleanup/cleanup.module';
import { ScheduleModule } from "@nestjs/schedule";

@Module({
    imports: [
        FilesModule,
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'app.db',
            entities: [FileEntity],
            synchronize: false,
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        CleanupModule,
        ScheduleModule.forRoot(),
    ],
    controllers: [AppController, UploadController, AuthController],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {

    }
}