-- AlterTable
ALTER TABLE "Treatment" ADD COLUMN "specificStartTime" DATETIME;
ALTER TABLE "Treatment" ADD COLUMN "startAtSpecificTime" BOOLEAN DEFAULT false;
