/*
  Warnings:

  - You are about to drop the column `academicSemesterId` on the `OfferedCourse` table. All the data in the column will be lost.
  - Added the required column `semesterRegistrationId` to the `OfferedCourse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OfferedCourse" DROP CONSTRAINT "OfferedCourse_academicSemesterId_fkey";

-- AlterTable
ALTER TABLE "OfferedCourse" DROP COLUMN "academicSemesterId",
ADD COLUMN     "semesterRegistrationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OfferedCourse" ADD CONSTRAINT "OfferedCourse_semesterRegistrationId_fkey" FOREIGN KEY ("semesterRegistrationId") REFERENCES "SemesterRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
