import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { studentEnrolledCourseFilterableFields } from './studentEnrolledCourse.constants';
import { StudentEnrolledCourseService } from './studentEnrolledCourse.service';

const createStudentEnrolledCourse = catchAsync(
  async (req: Request, res: Response) => {
    const data = req.body;

    const result =
      await StudentEnrolledCourseService.createStudentEnrolledCourse(data);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'StudentEnrolledCourseService fetched',
      data: result,
    });
  }
);
const getAllStudentEnrolledCourses = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, studentEnrolledCourseFilterableFields);
    const options = pick(req.query, paginationFields);

    const result =
      await StudentEnrolledCourseService.getAllStudentEnrolledCourses(
        filters,
        options
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'StudentEnrolledCourseServices fetched',
      meta: result.meta,
      data: result.data,
    });
  }
);

const getSingleStudentEnrolledCourse = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await StudentEnrolledCourseService.getSingleStudentEnrolledCourse(
        req.params.id
      );

    if (result) {
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'StudentEnrolledCourse fetched',
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'StudentEnrolledCourse not found',
        data: result,
      });
    }
  }
);

const updateStudentEnrolledCourse = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await StudentEnrolledCourseService.updateStudentEnrolledCourse(
        req.params.id,
        req.body
      );
    if (result) {
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'StudentEnrolledCourse updated successfully',
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'StudentEnrolledCourse not found',
        data: result,
      });
    }
  }
);

const deleteStudentEnrolledCourse = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result =
      await StudentEnrolledCourseService.deleteStudentEnrolledCourse(id);
    if (result) {
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'StudentEnrolledCourse deleted successfully',
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'StudentEnrolledCourse not found',
        data: result,
      });
    }
  }
);

export const StudentEnrolledCourseController = {
  createStudentEnrolledCourse,
  getAllStudentEnrolledCourses,
  getSingleStudentEnrolledCourse,
  updateStudentEnrolledCourse,
  deleteStudentEnrolledCourse,
};
