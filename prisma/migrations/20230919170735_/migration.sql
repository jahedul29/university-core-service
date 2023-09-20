/*
  Warnings:

  - You are about to drop the column `isCurrent` on the `academic_departments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "academic_departments" DROP COLUMN "isCurrent";

-- AlterTable
ALTER TABLE "academic_semesters" ADD COLUMN     "isCurrent" BOOLEAN DEFAULT false;
