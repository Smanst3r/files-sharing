import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "./file.entity";
import { FilesRepository } from "./files.repository";

@Module({
    imports: [TypeOrmModule.forFeature([FileEntity])],
    controllers: [FilesController],
    providers: [FilesService, FilesRepository],
    exports: [FilesService],
})
export class FilesModule {}