import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CourseController } from './course.controller';
import { CourseValidation } from './course.validation';

const router = express.Router();

router.post(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(CourseValidation.createValidation),
  CourseController.createCourse
);

router.get('/', CourseController.getAllCourses);
router.get('/:id', CourseController.getSingleCourse);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(CourseValidation.updateValidation),
  CourseController.updateCourse
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  CourseController.deleteCourse
);
router.post(
  '/assign-faculties/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(CourseValidation.assignOrRemoveFaculties),
  CourseController.assignFaculties
);
router.delete(
  '/remove-faculties/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(CourseValidation.assignOrRemoveFaculties),
  CourseController.removeFaculties
);

export const CourseRouter = router;
