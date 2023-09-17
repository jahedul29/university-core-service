/*
  Warnings:

  - You are about to drop the `OfferedCourse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OfferedCourseClassSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OfferedCourseSection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SemesterRegistration` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OfferedCourse" DROP CONSTRAINT "OfferedCourse_academicDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "OfferedCourse" DROP CONSTRAINT "OfferedCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "OfferedCourse" DROP CONSTRAINT "OfferedCourse_semesterRegistrationId_fkey";

-- DropForeignKey
ALTER TABLE "OfferedCourseClassSchedule" DROP CONSTRAINT "OfferedCourseClassSchedule_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "OfferedCourseClassSchedule" DROP CONSTRAINT "OfferedCourseClassSchedule_offeredCourseSectionId_fkey";

-- DropForeignKey
ALTER TABLE "OfferedCourseClassSchedule" DROP CONSTRAINT "OfferedCourseClassSchedule_roomId_fkey";

-- DropForeignKey
ALTER TABLE "OfferedCourseClassSchedule" DROP CONSTRAINT "OfferedCourseClassSchedule_semesterRegistrationId_fkey";

-- DropForeignKey
ALTER TABLE "OfferedCourseSection" DROP CONSTRAINT "OfferedCourseSection_offeredCourseId_fkey";

-- DropForeignKey
ALTER TABLE "OfferedCourseSection" DROP CONSTRAINT "OfferedCourseSection_semesterRegistrationId_fkey";

-- DropForeignKey
ALTER TABLE "SemesterRegistration" DROP CONSTRAINT "SemesterRegistration_academicSemesterId_fkey";

-- DropTable
DROP TABLE "OfferedCourse";

-- DropTable
DROP TABLE "OfferedCourseClassSchedule";

-- DropTable
DROP TABLE "OfferedCourseSection";

-- DropTable
DROP TABLE "SemesterRegistration";

-- CreateTable
CREATE TABLE "semester_registrations" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SemesterRegistrationStatus" DEFAULT 'UPCOMING',
    "minCredit" INTEGER NOT NULL DEFAULT 0,
    "maxCredit" INTEGER NOT NULL DEFAULT 0,
    "academicSemesterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semester_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offered_courses" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "academicDepartmentId" TEXT NOT NULL,
    "semesterRegistrationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offered_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offered_course_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "currentlyEnrolledStudent" INTEGER NOT NULL DEFAULT 0,
    "offeredCourseId" TEXT NOT NULL,
    "semesterRegistrationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offered_course_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offered_course_class_schedules" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "WeekDays" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "offeredCourseSectionId" TEXT NOT NULL,
    "semesterRegistrationId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offered_course_class_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_semester_registrations" (
    "id" TEXT NOT NULL,
    "isConfirmed" BOOLEAN DEFAULT false,
    "totalCreditsTaken" INTEGER DEFAULT 0,
    "semesterRegistrationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_semester_registrations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "semester_registrations" ADD CONSTRAINT "semester_registrations_academicSemesterId_fkey" FOREIGN KEY ("academicSemesterId") REFERENCES "academic_semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_courses" ADD CONSTRAINT "offered_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_courses" ADD CONSTRAINT "offered_courses_academicDepartmentId_fkey" FOREIGN KEY ("academicDepartmentId") REFERENCES "academic_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_courses" ADD CONSTRAINT "offered_courses_semesterRegistrationId_fkey" FOREIGN KEY ("semesterRegistrationId") REFERENCES "semester_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_course_sections" ADD CONSTRAINT "offered_course_sections_offeredCourseId_fkey" FOREIGN KEY ("offeredCourseId") REFERENCES "offered_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_course_sections" ADD CONSTRAINT "offered_course_sections_semesterRegistrationId_fkey" FOREIGN KEY ("semesterRegistrationId") REFERENCES "semester_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_course_class_schedules" ADD CONSTRAINT "offered_course_class_schedules_offeredCourseSectionId_fkey" FOREIGN KEY ("offeredCourseSectionId") REFERENCES "offered_course_sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_course_class_schedules" ADD CONSTRAINT "offered_course_class_schedules_semesterRegistrationId_fkey" FOREIGN KEY ("semesterRegistrationId") REFERENCES "semester_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_course_class_schedules" ADD CONSTRAINT "offered_course_class_schedules_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_course_class_schedules" ADD CONSTRAINT "offered_course_class_schedules_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_semester_registrations" ADD CONSTRAINT "student_semester_registrations_semesterRegistrationId_fkey" FOREIGN KEY ("semesterRegistrationId") REFERENCES "semester_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_semester_registrations" ADD CONSTRAINT "student_semester_registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
