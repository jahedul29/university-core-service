import { OfferedCourseSection, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { asyncForEach } from '../../../shared/utils';
import { OfferedCourseClassScheduleUtils } from '../offeredCourseClassSchedule/offeredCourseClassSchedule.utils';
import { offeredCourseSectionSearchableFields } from './offeredCourseSection.constants';
import { IOfferedCourseSectionFilterRequest } from './offeredCourseSection.interface';

const createOfferedCourseSection = async (
  data: any
): Promise<OfferedCourseSection | null> => {
  const { classSchedules, ...sectionData } = data;

  const isOfferedCourseExist = await prisma.offeredCourse.findFirst({
    where: {
      id: data.offeredCourseId,
    },
  });

  if (!isOfferedCourseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Offered course does not exist');
  }

  const tempData: OfferedCourseSection = {
    ...sectionData,
    semesterRegistrationId: isOfferedCourseExist.semesterRegistrationId,
  };

  const isOfferedCourseSectionExist =
    await prisma.offeredCourseSection.findFirst({
      where: {
        offeredCourse: {
          id: data.offeredCourseId,
        },
        title: data.title,
      },
    });

  if (isOfferedCourseSectionExist) {
    throw new ApiError(httpStatus.BAD_GATEWAY, `Course section already exist`);
  }

  await asyncForEach(classSchedules, async (schedule: any) => {
    const isExistRoom = await prisma.room.findFirst({
      where: {
        id: schedule.roomId,
      },
    });

    if (!isExistRoom) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `roomId ${schedule.roomId} does not exist`
      );
    }

    const isExistFaculty = await prisma.faculty.findFirst({
      where: {
        id: schedule.facultyId,
      },
    });

    if (!isExistFaculty) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `facultyId ${schedule.facultyId} does not exist`
      );
    }

    await OfferedCourseClassScheduleUtils.checkRoomAvailability(schedule);
    await OfferedCourseClassScheduleUtils.checkFacultyAvailability(schedule);
  });

  const createSection = await prisma.$transaction(async txnClient => {
    const result = await txnClient.offeredCourseSection.create({
      data: tempData,
    });

    const scheduleData = classSchedules.map((schedule: any) => ({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      offeredCourseSectionId: result.id,
      semesterRegistrationId: result.semesterRegistrationId,
      roomId: schedule.roomId,
      facultyId: schedule.facultyId,
    }));

    await txnClient.offeredCourseClassSchedule.createMany({
      data: scheduleData,
    });

    return result;
  });

  if (!createSection?.id) {
    throw new ApiError(
      httpStatus.BAD_GATEWAY,
      `something wrong when creating section`
    );
  } else {
    const result = await prisma.offeredCourseSection.findFirst({
      where: {
        id: createSection.id,
      },
      include: {
        offeredCourse: {
          include: {
            course: true,
          },
        },
        offeredCourseClassSchedules: {
          include: {
            room: {
              include: {
                building: true,
              },
            },
            faculty: true,
          },
        },
      },
    });

    return result;
  }
};

const getAllOfferedCourseSections = async (
  filters: IOfferedCourseSectionFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<OfferedCourseSection[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: offeredCourseSectionSearchableFields.map(field => ({
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

  const whereConditions: Prisma.OfferedCourseSectionWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const result = await prisma.offeredCourseSection.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      offeredCourse: true,
      semesterRegistration: true,
    },
  });

  const total = await prisma.offeredCourseSection.count({
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

const getSingleOfferedCourseSection = async (
  id: string
): Promise<OfferedCourseSection | null> => {
  const result = await prisma.offeredCourseSection.findUnique({
    where: {
      id,
    },
    include: {
      offeredCourse: true,
      semesterRegistration: true,
    },
  });

  return result;
};

const updateOfferedCourseSection = async (
  id: string,
  payload: Partial<OfferedCourseSection>
): Promise<OfferedCourseSection> => {
  let tempData = { ...payload };

  if (tempData.offeredCourseId) {
    const isOfferedCourseExist = await prisma.offeredCourse.findFirst({
      where: {
        id: payload.offeredCourseId,
      },
    });

    if (!isOfferedCourseExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Offered course does not exist');
    }

    tempData = {
      ...tempData,
      semesterRegistrationId: isOfferedCourseExist.semesterRegistrationId,
    };
  }

  const result = await prisma.offeredCourseSection.update({
    where: {
      id,
    },
    include: {
      offeredCourse: true,
      semesterRegistration: true,
    },
    data: tempData,
  });
  return result;
};

const deleteOfferedCourseSection = async (
  id: string
): Promise<OfferedCourseSection> => {
  const result = await prisma.offeredCourseSection.delete({
    where: {
      id,
    },
    include: {
      offeredCourse: true,
      semesterRegistration: true,
    },
  });
  return result;
};

export const OfferedCourseSectionService = {
  createOfferedCourseSection,
  getAllOfferedCourseSections,
  getSingleOfferedCourseSection,
  updateOfferedCourseSection,
  deleteOfferedCourseSection,
};
