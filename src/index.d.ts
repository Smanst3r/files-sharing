declare module "express-session" {
    interface SessionData {
        user?: {
            authenticated: boolean
            uploadDir: string
        };
    }
}

declare global {
    type TFileData = {
        name: string,
        size: number,
        mtime: Date,
        ctime: Date,
        isFile: boolean,
        isDirectory: boolean,
        sizeFormatted: string
        dateOfRemoval?: Date

        token?: string
        tokenExpiresAt?: Date
    }
}

export {};