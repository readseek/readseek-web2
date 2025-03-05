/*
  Warnings:

  - Added the required column `type` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TXT', 'PDF', 'EPUB', 'DOC', 'DOCX', 'CSV', 'TSV', 'MARKDOWN', 'HTML', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DocumentLang" AS ENUM ('ENG', 'CHI', 'ZHO', 'JPN');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('bot', 'human');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "lang" "DocumentLang" NOT NULL DEFAULT 'ENG',
ADD COLUMN     "type" "DocumentType" NOT NULL,
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "description" SET DATA TYPE TEXT,
ALTER COLUMN "keywords" SET DATA TYPE TEXT[],
ALTER COLUMN "coverUrl" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatar" SET DATA TYPE VARCHAR(300);

-- CreateTable
CREATE TABLE "Message" (
    "id" VARCHAR(64) NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" VARCHAR(32) NOT NULL,
    "rags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "option" JSONB,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "uid" INTEGER NOT NULL,
    "gid" INTEGER NOT NULL DEFAULT -1,
    "name" VARCHAR(255) NOT NULL,
    "prompt" TEXT NOT NULL DEFAULT '',
    "createAt" VARCHAR(32) NOT NULL,
    "updateAt" VARCHAR(32) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_cid_key" ON "Conversation"("cid");

-- CreateIndex
CREATE INDEX "Conversation_uid_idx" ON "Conversation"("uid");

-- CreateIndex
CREATE INDEX "Conversation_cid_idx" ON "Conversation"("cid");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
