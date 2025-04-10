import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { UploadController } from "./upload/upload.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./files/file.entity";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth/auth.controller";
import { AppController } from "./app.controller";

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
    ],
    controllers: [AppController, UploadController, AuthController],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {

    }
}