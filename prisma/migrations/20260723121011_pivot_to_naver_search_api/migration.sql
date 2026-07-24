/*
  Warnings:

  - You are about to drop the column `crawlJobId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `installFee` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isAd` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `page` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shippingFee` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `CrawlJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductDetailContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductSpec` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `searchJobId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `productUrl` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SearchJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "CrawlJob" DROP CONSTRAINT "CrawlJob_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CrawlJob" DROP CONSTRAINT "CrawlJob_createdById_fkey";

-- DropForeignKey
ALTER TABLE "CrawlJob" DROP CONSTRAINT "CrawlJob_keywordId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_crawlJobId_fkey";

-- DropForeignKey
ALTER TABLE "ProductDetailContent" DROP CONSTRAINT "ProductDetailContent_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSpec" DROP CONSTRAINT "ProductSpec_productId_fkey";

-- DropIndex
DROP INDEX "Product_crawlJobId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "crawlJobId",
DROP COLUMN "installFee",
DROP COLUMN "isAd",
DROP COLUMN "page",
DROP COLUMN "shippingFee",
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "highPrice" INTEGER,
ADD COLUMN     "maker" TEXT,
ADD COLUMN     "naverCategory1" TEXT,
ADD COLUMN     "naverCategory2" TEXT,
ADD COLUMN     "naverCategory3" TEXT,
ADD COLUMN     "naverCategory4" TEXT,
ADD COLUMN     "naverProductType" TEXT,
ADD COLUMN     "searchJobId" TEXT NOT NULL,
ALTER COLUMN "productUrl" SET NOT NULL;

-- DropTable
DROP TABLE "CrawlJob";

-- DropTable
DROP TABLE "ProductDetailContent";

-- DropTable
DROP TABLE "ProductSpec";

-- DropEnum
DROP TYPE "CrawlStatus";

-- CreateTable
CREATE TABLE "SearchJob" (
    "id" TEXT NOT NULL,
    "status" "SearchJobStatus" NOT NULL DEFAULT 'PENDING',
    "keyword" TEXT NOT NULL,
    "categoryId" TEXT,
    "keywordId" TEXT,
    "createdById" TEXT,
    "requestedCount" INTEGER NOT NULL DEFAULT 20,
    "collectedCount" INTEGER NOT NULL DEFAULT 0,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchJob_status_idx" ON "SearchJob"("status");

-- CreateIndex
CREATE INDEX "SearchJob_createdAt_idx" ON "SearchJob"("createdAt");

-- CreateIndex
CREATE INDEX "Product_searchJobId_idx" ON "Product"("searchJobId");

-- AddForeignKey
ALTER TABLE "SearchJob" ADD CONSTRAINT "SearchJob_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchJob" ADD CONSTRAINT "SearchJob_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "KeywordHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchJob" ADD CONSTRAINT "SearchJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_searchJobId_fkey" FOREIGN KEY ("searchJobId") REFERENCES "SearchJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
