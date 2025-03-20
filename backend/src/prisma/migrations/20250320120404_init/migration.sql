-- CreateTable
CREATE TABLE "Video" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileName" TEXT NOT NULL,
    "folderPath" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "screenshotFilePath" TEXT
);

-- CreateTable
CREATE TABLE "WatchHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "watchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoId" INTEGER NOT NULL,
    CONSTRAINT "WatchHistory_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "XMLCommentFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "commentCount" INTEGER NOT NULL,
    "commentedDate" DATETIME NOT NULL,
    "fileName" TEXT NOT NULL,
    "folderPath" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_filePath_key" ON "Video"("filePath");

-- CreateIndex
CREATE UNIQUE INDEX "XMLCommentFile_filePath_key" ON "XMLCommentFile"("filePath");
