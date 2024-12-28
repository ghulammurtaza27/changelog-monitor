-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('FEATURE', 'BUGFIX', 'ENHANCEMENT', 'REFACTOR', 'DOCS', 'BREAKING', 'SECURITY', 'PERFORMANCE', 'DEPENDENCY', 'OTHER');

-- CreateTable
CREATE TABLE "Changelog" (
    "id" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "whatsNew" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "upgrade" TEXT NOT NULL,
    "breaking" BOOLEAN NOT NULL DEFAULT false,
    "security" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Changelog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Change" (
    "id" TEXT NOT NULL,
    "changelogId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ChangeType" NOT NULL,
    "impact" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorEmail" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "details" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "whatsNew" TEXT NOT NULL,
    "breaking" BOOLEAN NOT NULL DEFAULT false,
    "security" BOOLEAN NOT NULL DEFAULT false,
    "filesChanged" TEXT[],
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Change_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Changelog_repoUrl_idx" ON "Changelog"("repoUrl");

-- CreateIndex
CREATE INDEX "Changelog_version_idx" ON "Changelog"("version");

-- CreateIndex
CREATE INDEX "Changelog_date_idx" ON "Changelog"("date");

-- CreateIndex
CREATE INDEX "Change_changelogId_idx" ON "Change"("changelogId");

-- CreateIndex
CREATE INDEX "Change_type_idx" ON "Change"("type");

-- CreateIndex
CREATE INDEX "Change_date_idx" ON "Change"("date");

-- CreateIndex
CREATE INDEX "Change_sha_idx" ON "Change"("sha");

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_changelogId_fkey" FOREIGN KEY ("changelogId") REFERENCES "Changelog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
