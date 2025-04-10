import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { join } from 'path';
import { NestExpressApplication } from "@nestjs/platform-express";
import * as path from "path";
import { ConfigService } from "@nestjs/config";
import * as session from 'express-session';
// @ts-ignore
import * as fileStoreFactory from 'session-file-store';
import { AuthGuard } from "./auth/auth.guard";
import * as hbs from 'hbs';
import { format as dateFormat, formatDistanceToNow } from "date-fns";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(cookieParser());
    app.useStaticAssets(join(__dirname, '..', 'public'), {
        index: false,
    });
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    hbs.registerHelper('formatDate', function(date: Date|string, format: string) {
        if (format === 'formatDistanceToNow') {
            return formatDistanceToNow(date, { addSuffix: true });
        }
        return dateFormat(date, format);
    });

    const FileStore = fileStoreFactory(session);
    const config = app.get(ConfigService);

    const sessionLifetime = parseInt(config.get('SESSION_LIFETIME_DAYS', '7'), 10) * 24 * 60 * 60;
    const sessionSecret = config.get('SESSION_SECRET');
    if (!sessionSecret) {
        throw new Error('Mandatory SESSION_SECRET is missing in .env');
    }


    const sessionDir = path.resolve(__dirname, '..', 'sessions');
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir);
    }
    app.use(
        session({
            store: new FileStore({
                path: sessionDir,
                ttl: sessionLifetime
            }),
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: sessionLifetime * 1000,
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
            },
        }),
    );

    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
    }

    app.useGlobalGuards(new AuthGuard(config));
    app.enableCors();
    await app.listen(3000);
}

bootstrap();
