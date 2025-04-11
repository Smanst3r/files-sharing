import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileEntity } from "../files/file.entity";

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  providers: [CleanupService],
})
export class CleanupModule {}
