import express from 'express';
import { AcademicDepartmentRouter } from '../modules/academicDepartment/academicDepartment.route';
import { AcademicFacultyRouter } from '../modules/academicFaculty/academicFaculty.route';
import { AcademicSemesterRouter } from '../modules/academicSemester/academicSemester.route';
import { BuildingRouter } from '../modules/building/building.route';
import { CourseRouter } from '../modules/course/course.route';
import { FacultyRouter } from '../modules/faculty/faculty.route';
import { RoomRouter } from '../modules/room/room.route';
import { StudentRouter } from '../modules/student/student.route';

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
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
