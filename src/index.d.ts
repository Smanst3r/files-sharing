declare module "express-session" {
    interface SessionData {
        user?: {
            authenticated: boolean
            uploadDir: string
        };
    }
}

declare global {
    type TFileStat = {
        name: string,
        size: number,
        mtime: Date,
        ctime: Date,
        isFile: boolean,
        isDirectory: boolean,
    }
    type TUploadedFile = TFileStat & {
        id: number
        sizeFormatted: string
        token: string
        tokenExpiresAt: Date
        tokenIsExpired: boolean
        dateOfRemoval?: Date
    }
}

export {};