CREATE TABLE IF NOT EXISTS "file_entity"
(
    id        TEXT not null primary key,
    token     TEXT not null,
    fileName  TEXT not null,
    expiresAt TEXT not null,
    sessionId TEXT not null
);
