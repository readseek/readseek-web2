-- CreateEnum
CREATE TYPE "DocumentState" AS ENUM ('SUCCESS', 'FAILED', 'PENDING', 'PROCESSING');

-- CreateTable
CREATE TABLE "Category" (
    "id" SMALLSERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "alias" VARCHAR(64),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SMALLSERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "alias" VARCHAR(64),

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" VARCHAR(64) NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "keywords" VARCHAR(128)[],
    "authors" VARCHAR(128)[],
    "categoryId" SMALLINT NOT NULL,
    "userId" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "coverUrl" VARCHAR(255),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "state" "DocumentState" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "age" SMALLINT NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "avatar" VARCHAR(255),
    "bio" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentToTag" (
    "A" VARCHAR(64) NOT NULL,
    "B" SMALLINT NOT NULL,

    CONSTRAINT "_DocumentToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "_DocumentToTag_B_index" ON "_DocumentToTag"("B");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToTag" ADD CONSTRAINT "_DocumentToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToTag" ADD CONSTRAINT "_DocumentToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
