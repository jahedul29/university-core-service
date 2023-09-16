import { OfferedCourseSection } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { offeredCourseSectionFilterableFields } from './offeredCourseSection.constants';
import { OfferedCourseSectionService } from './offeredCourseSection.service';

const createOfferedCourseSection = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OfferedCourseSectionService.createOfferedCourseSection(
      req.body
    );
    sendResponse<OfferedCourseSection>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OfferedCourseSection created',
      data: result,
    });
  }
);

const getAllFaculties = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, offeredCourseSectionFilterableFields);
  const options = pick(req.query, paginationFields);

  const result = await OfferedCourseSectionService.getAllOfferedCourseSections(
    filters,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OfferedCourseSections fetched',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleOfferedCourseSection = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OfferedCourseSectionService.getSingleOfferedCourseSection(
        req.params.id
      );

    if (result) {
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'OfferedCourseSection fetched',
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'OfferedCourseSection not found',
        data: result,
      });
    }
  }
);

const updateOfferedCourseSection = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OfferedCourseSectionService.updateOfferedCourseSection(
      req.params.id,
      req.body
    );
    if (result) {
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'OfferedCourseSection updated successfully',
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'OfferedCourseSection not found',
        data: result,
      });
    }
  }
);

const deleteOfferedCourseSection = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await OfferedCourseSectionService.deleteOfferedCourseSection(
      id
    );
    if (result) {
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'OfferedCourseSection deleted successfully',
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'OfferedCourseSection not found',
        data: result,
      });
    }
  }
);

export const OfferedCourseSectionController = {
  createOfferedCourseSection,
  getAllFaculties,
  getSingleOfferedCourseSection,
  updateOfferedCourseSection,
  deleteOfferedCourseSection,
};
