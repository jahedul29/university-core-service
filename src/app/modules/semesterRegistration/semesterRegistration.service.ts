import {
  Prisma,
  SemesterRegistration,
  SemesterRegistrationStatus,
  StudentSemesterRegistration,
} from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { semesterStudentRegistrationCourseService } from '../semesterStudentRegistrationCourse/semesterStudentRegistrationCourse.service';
import { semesterRegistrationSearchableFields } from './semesterRegistration.constants';
import { ISemesterRegistrationFilterRequest } from './semesterRegistration.interface';

const createSemesterRegistration = async (
  data: SemesterRegistration
): Promise<SemesterRegistration> => {
  const isAnySemesterUpcomingOrOngoing =
    await prisma.semesterRegistration.findFirst({
      where: {
        OR: [
          {
            status: SemesterRegistrationStatus.UPCOMING,
          },
          {
            status: SemesterRegistrationStatus.ONGOING,
          },
        ],
      },
    });

  if (isAnySemesterUpcomingOrOngoing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `There is already an ${isAnySemesterUpcomingOrOngoing.status} registration`
    );
  }

  const result = await prisma.semesterRegistration.create({
    data,
    include: {
      academicSemester: true,
    },
  });

  return result;
};

const getAllSemesterRegistrations = async (
  filters: ISemesterRegistrationFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<SemesterRegistration[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: semesterRegistrationSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.SemesterRegistrationWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const result = await prisma.semesterRegistration.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      academicSemester: true,
    },
  });

  const total = await prisma.semesterRegistration.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getSingleSemesterRegistration = async (
  id: string
): Promise<SemesterRegistration | null> => {
  const result = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
  });

  return result;
};

const updateSemesterRegistration = async (
  id: string,
  payload: Partial<SemesterRegistration>
): Promise<SemesterRegistration> => {
  const isExist = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Semester registration not found');
  }

  if (
    payload.status &&
    isExist.status === SemesterRegistrationStatus.UPCOMING &&
    payload.status !== SemesterRegistrationStatus.ONGOING
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Can only move from UPCOMING to ONGOING'
    );
  }
  if (
    payload.status &&
    isExist.status === SemesterRegistrationStatus.ONGOING &&
    payload.status !== SemesterRegistrationStatus.ENDED
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Can only move from ONGOING to ENDED'
    );
  }

  const result = await prisma.semesterRegistration.update({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
    data: payload,
  });
  return result;
};

const deleteSemesterRegistration = async (
  id: string
): Promise<SemesterRegistration> => {
  const result = await prisma.semesterRegistration.delete({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
  });
  return result;
};

const startRegistration = async (
  studentId: string
): Promise<{
  semesterRegistration: SemesterRegistration | null;
  studentSemesterRegistration: StudentSemesterRegistration | null;
}> => {
  const isStudentExist = await prisma.student.findFirst({
    where: {
      studentId,
    },
    include: {
      academicDepartment: true,
      academicFaculty: true,
      academicSemester: true,
      studentSemesterRegistrations: true,
    },
  });

  if (!isStudentExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
  }

  const isSemesterExist = await prisma.semesterRegistration.findFirst({
    where: {
      status: {
        in: [
          SemesterRegistrationStatus.UPCOMING,
          SemesterRegistrationStatus.ONGOING,
        ],
      },
    },
  });

  if (isSemesterExist?.status === SemesterRegistrationStatus.UPCOMING) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Registration not started yet');
  }

  let studentRegistration = await prisma.studentSemesterRegistration.findFirst({
    where: {
      student: {
        studentId: isStudentExist.studentId,
      },
      semesterRegistration: {
        id: isSemesterExist?.id,
      },
    },
  });

  if (!studentRegistration) {
    studentRegistration = await prisma.studentSemesterRegistration.create({
      data: {
        student: {
          connect: {
            id: isStudentExist.id,
          },
        },
        semesterRegistration: {
          connect: {
            id: isSemesterExist?.id,
          },
        },
      },
    });
  }

  return {
    semesterRegistration: isSemesterExist,
    studentSemesterRegistration: studentRegistration,
  };
};

const enrollIntoCourse = async (
  userId: string,
  payload: { offeredCourseId: string; offeredCourseSectionId: string }
) => {
  return await semesterStudentRegistrationCourseService.enrollIntoCourse(
    userId,
    payload
  );
};

const withdrawFromCourse = async (
  userId: string,
  payload: { offeredCourseId: string; offeredCourseSectionId: string }
) => {
  return await semesterStudentRegistrationCourseService.withdrawFromCourse(
    userId,
    payload
  );
};

const confirmStudentSemesterRegistration = async (
  userId: string
): Promise<{
  message: string;
}> => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
  });
  if (!semesterRegistration) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No ongoing semester found');
  }

  const studentSemesterRegistration =
    await prisma.studentSemesterRegistration.findFirst({
      where: {
        student: {
          studentId: userId,
        },
        semesterRegistration: {
          id: semesterRegistration.id,
        },
      },
    });

  if (!studentSemesterRegistration) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'This student is not enrolled in any course'
    );
  }

  if (studentSemesterRegistration.totalCreditsTaken === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'you are not enrolled in any course'
    );
  }

  if (
    semesterRegistration.maxCredit &&
    semesterRegistration.minCredit &&
    studentSemesterRegistration.totalCreditsTaken &&
    (studentSemesterRegistration.totalCreditsTaken <
      semesterRegistration.minCredit ||
      studentSemesterRegistration.totalCreditsTaken >
        semesterRegistration.maxCredit)
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `You can take between ${semesterRegistration.minCredit} to ${semesterRegistration.maxCredit}`
    );
  }

  await prisma.studentSemesterRegistration.update({
    where: {
      id: studentSemesterRegistration.id,
    },
    data: {
      isConfirmed: true,
    },
  });

  return {
    message: 'Your registration is confirmed',
  };
};

const getMyRegistration = async (userId: string): Promise<any> => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
  });
  if (!semesterRegistration) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No ongoing semester found');
  }

  const studentSemesterRegistration =
    await prisma.studentSemesterRegistration.findFirst({
      where: {
        semesterRegistration: {
          id: semesterRegistration.id,
        },
        student: {
          studentId: userId,
        },
      },
    });

  return { semesterRegistration, studentSemesterRegistration };
};

export const SemesterRegistrationService = {
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
};
