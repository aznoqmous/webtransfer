-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Archive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "title" TEXT,
    "filesCount" INTEGER,
    "fileSize" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Archive_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Archive" ("createdAt", "downloadCount", "fileSize", "filesCount", "id", "title", "userId", "uuid") SELECT "createdAt", "downloadCount", "fileSize", "filesCount", "id", "title", "userId", "uuid" FROM "Archive";
DROP TABLE "Archive";
ALTER TABLE "new_Archive" RENAME TO "Archive";
CREATE UNIQUE INDEX "Archive_uuid_key" ON "Archive"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
