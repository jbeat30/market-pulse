-- User 테이블 데이터 없음(count=0) 확인 후 안전하게 컬럼명 변경
-- DropIndex
DROP INDEX IF EXISTS "User_email_idx";
DROP INDEX IF EXISTS "User_email_key";

-- AlterTable
ALTER TABLE "User" RENAME COLUMN "email" TO "userId";

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");
CREATE INDEX "User_userId_idx" ON "User"("userId");
