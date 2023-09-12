import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AcademicDepartmentController } from './academicDepartment.controller';
import { AcademicDepartmentValidation } from './academicDepartment.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(AcademicDepartmentValidation.createValidation),
  AcademicDepartmentController.createAcademicDepartment
);
router.get('/', AcademicDepartmentController.getAllSemesters);
router.get('/:id', AcademicDepartmentController.getSingleSemester);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(AcademicDepartmentValidation.updateValidation),
  AcademicDepartmentController.updateAcademicDepartment
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AcademicDepartmentController.deleteAcademicDepartment
);

export const AcademicDepartmentRouter = router;
