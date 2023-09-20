import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { StudentEnrolledCourseMarkController } from './studentEnrolledCourseMark.controller';
import { StudentEnrolledCourseMarkValidation } from './studentEnrolledCourseMark.validation';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.FACULTY),
  StudentEnrolledCourseMarkController.getAllStudentEnrolledCourseMarks
);

router.patch(
  '/update-marks',
  auth(ENUM_USER_ROLE.FACULTY, ENUM_USER_ROLE.ADMIN),
  validateRequest(StudentEnrolledCourseMarkValidation.update),
  StudentEnrolledCourseMarkController.updateMarks
);

export const StudentEnrolledCourseMarksRoute = router;
