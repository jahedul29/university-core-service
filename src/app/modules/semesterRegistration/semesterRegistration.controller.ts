import { SemesterRegistration } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { semesterRegistrationFilterableFields } from './semesterRegistration.constants';
import { SemesterRegistrationService } from './semesterRegistration.service';

const createSemesterRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SemesterRegistrationService.createSemesterRegistration(
      req.body
    );
    sendResponse<SemesterRegistration>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Semester registration created',
      data: result,
    });
  }
);

const getAllSemesterRegistrations = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, semesterRegistrationFilterableFields);
    const options = pick(req.query, paginationFields);

    const result =
      await SemesterRegistrationService.getAllSemesterRegistrations(
        filters,
        options
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Semester Registration fetched',
      meta: result.meta,
      data: result.data,
    });
  }
);

const getSingleSemesterRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SemesterRegistrationService.getSingleSemesterRegistration(
        req.params.id
      );

    if (result) {
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Semester Registration fetched',
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'Semester Registration not found',
        data: result,
      });
    }
  }
);

const updateSemesterRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SemesterRegistrationService.updateSemesterRegistration(
      req.params.id,
      req.body
    );
    if (result) {
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Semester Registration updated successfully',
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'Semester Registration not found',
        data: result,
      });
    }
  }
);

const deleteSemesterRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await SemesterRegistrationService.deleteSemesterRegistration(
      id
    );
    if (result) {
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Semester Registration deleted successfully',
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'Semester Registration not found',
        data: result,
      });
    }
  }
);

const startRegistration = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await SemesterRegistrationService.startRegistration(
    user.userId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student Semester Registration successful',
    data: result,
  });
});

const enrollIntoCourse = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const data = req.body;

  const result = await SemesterRegistrationService.enrollIntoCourse(
    user.userId,
    data
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully enrolled into course',
    data: result,
  });
});

const withdrawFromCourse = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const data = req.body;

  const result = await SemesterRegistrationService.withdrawFromCourse(
    user.userId,
    data
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully withdrew from course',
    data: result,
  });
});

const confirmStudentSemesterRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as any;

    const result =
      await SemesterRegistrationService.confirmStudentSemesterRegistration(
        user.userId
      );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Successfully confirmed the registration',
      data: result,
    });
  }
);

const getMyRegistration = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;

  const result = await SemesterRegistrationService.getMyRegistration(
    user.userId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My registration data fetched',
    data: result,
  });
});

const startNewSemester = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await SemesterRegistrationService.startNewSemester(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Semester started successfully',
    data: result,
  });
});

const getEnrollableSemesterRegistrationCourses = catchAsync(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    const result =
      await SemesterRegistrationService.getEnrollableSemesterRegistrationCourses(
        userId
      );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Enrollable courses fetched successfully successfully',
      data: result,
    });
  }
);

export const SemesterRegistrationController = {
  createSemesterRegistration,
  getAllSemesterRegistrations,
  getSingleSemesterRegistration,
  updateSemesterRegistration,
  deleteSemesterRegistration,
  startRegistration,
  enrollIntoCourse,
  withdrawFromCourse,
  confirmStudentSemesterRegistration,
  getMyRegistration,
  startNewSemester,
  getEnrollableSemesterRegistrationCourses,
};
