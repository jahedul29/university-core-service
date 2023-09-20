import express from 'express';
import { AcademicDepartmentRouter } from '../modules/academicDepartment/academicDepartment.route';
import { AcademicFacultyRouter } from '../modules/academicFaculty/academicFaculty.route';
import { AcademicSemesterRouter } from '../modules/academicSemester/academicSemester.route';
import { BuildingRouter } from '../modules/building/building.route';
import { CourseRouter } from '../modules/course/course.route';
import { FacultyRouter } from '../modules/faculty/faculty.route';
import { OfferedCourseRouter } from '../modules/offeredCourse/offeredCourse.route';
import { OfferedCourseClassScheduleRouter } from '../modules/offeredCourseClassSchedule/offeredCourseClassSchedule.route';
import { OfferedCourseSectionRouter } from '../modules/offeredCourseSection/offeredCourseSection.route';
import { RoomRouter } from '../modules/room/room.route';
import { SemesterRegistrationRouter } from '../modules/semesterRegistration/semesterRegistration.route';
import { StudentRouter } from '../modules/student/student.route';
import { StudentEnrolledCourseRouter } from '../modules/studentEnrolledCourse/studentEnrolledCourse.route';
import { StudentEnrolledCourseMarksRoute } from '../modules/studentEnrolledCourseMark/studentEnrolledCourseMark.route';
import { studentSemesterPaymentRoutes } from './../modules/studentSemesterPayment/.studentSemesterPayment.route';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/academic-semesters',
    route: AcademicSemesterRouter,
  },
  {
    path: '/academic-faculties',
    route: AcademicFacultyRouter,
  },
  {
    path: '/academic-departments',
    route: AcademicDepartmentRouter,
  },
  {
    path: '/students',
    route: StudentRouter,
  },
  {
    path: '/faculties',
    route: FacultyRouter,
  },
  {
    path: '/buildings',
    route: BuildingRouter,
  },
  {
    path: '/rooms',
    route: RoomRouter,
  },
  {
    path: '/courses',
    route: CourseRouter,
  },
  {
    path: '/semester-registrations',
    route: SemesterRegistrationRouter,
  },
  {
    path: '/offered-courses',
    route: OfferedCourseRouter,
  },
  {
    path: '/offered-course-sections',
    route: OfferedCourseSectionRouter,
  },
  {
    path: '/offered-course-class-schedules',
    route: OfferedCourseClassScheduleRouter,
  },
  {
    path: '/student-enrolled-course-marks',
    route: StudentEnrolledCourseMarksRoute,
  },
  {
    path: '/student-semester-payments',
    route: studentSemesterPaymentRoutes,
  },
  {
    path: '/student-enrolled-courses',
    route: StudentEnrolledCourseRouter,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
