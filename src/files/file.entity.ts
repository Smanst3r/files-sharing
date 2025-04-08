import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity("file_entity")
@Index(['sessionId', 'fileName'], { unique: true })
export class FileEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sessionId: string;

    @Column()
    token: string;

    @Column()
    fileName: string;

    @Column()
    expiresAt: Date;
}
