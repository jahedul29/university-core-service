import { Course, CourseFaculty, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { asyncForEach } from '../../../shared/utils';
import { courseSearchableFields } from '../course/course.constants';
import {
  ICourseFilterRequest,
  ICourseRequestData,
  IPrerequisiteCourseRequest,
} from './course.interface';

const createCourse = async (data: ICourseRequestData): Promise<any> => {
  const { prerequisiteCourses, ...courseData } = data;

  const newCourse = await prisma.$transaction(async txClient => {
    const result = await txClient.course.create({
      data: courseData,
    });

    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course');
    }

    if (prerequisiteCourses && prerequisiteCourses.length > 0) {
      await asyncForEach(
        prerequisiteCourses,
        async (prerequisiteCourse: IPrerequisiteCourseRequest) => {
          const createPrerequisite = await txClient.courseToPrerequisite.create(
            {
              data: {
                courseId: result.id,
                preRequisiteId: prerequisiteCourse.courseId,
              },
            }
          );
          console.log(createPrerequisite);
        }
      );
    }

    return result;
  });

  console.log({ newCourse });

  if (newCourse) {
    const responseData = await prisma.course.findUnique({
      where: {
        id: newCourse.id,
      },
      include: {
        preRequisite: {
          include: {
            preRequisite: true,
          },
        },
        preRequisiteFor: {
          include: {
            course: true,
          },
        },
      },
    });

    return responseData;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course');
};

const getAllCourses = async (
  filters: ICourseFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Course[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: courseSearchableFields.map(field => ({
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

  const whereConditions: Prisma.CourseWhereInput = andConditions.length
    ? { AND: andConditions }
    : {};

  const result = await prisma.course.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.course.count({
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

const getSingleCourse = async (id: string): Promise<Course | null> => {
  const result = await prisma.course.findUnique({
    where: {
      id,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const responseData = await prisma.course.findUnique({
    where: {
      id: result.id,
    },
    include: {
      preRequisite: {
        include: {
          preRequisite: true,
        },
      },
      preRequisiteFor: {
        include: {
          course: true,
        },
      },
    },
  });

  return responseData;
};

const updateCourse = async (
  id: string,
  payload: ICourseRequestData
): Promise<Course | null> => {
  const { prerequisiteCourses, ...courseData } = payload;

  const updatedCourse = await prisma.$transaction(async txnClient => {
    const result = await txnClient.course.update({
      where: {
        id,
      },
      data: courseData,
    });

    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
    }

    if (prerequisiteCourses && prerequisiteCourses.length > 0) {
      const deletePrerequisite = prerequisiteCourses.filter(
        item => item.courseId && item.isDeleted
      );
      const newPrerequisites = prerequisiteCourses.filter(
        item => !(item.courseId && item.isDeleted)
      );

      await asyncForEach(
        deletePrerequisite,
        async (deletePreCourse: IPrerequisiteCourseRequest) => {
          await txnClient.courseToPrerequisite.deleteMany({
            where: {
              AND: [
                {
                  courseId: id,
                },
                {
                  preRequisiteId: deletePreCourse.courseId,
                },
              ],
            },
          });
        }
      );

      await asyncForEach(
        newPrerequisites,
        async (insertPrerequisite: IPrerequisiteCourseRequest) => {
          await txnClient.courseToPrerequisite.create({
            data: {
              courseId: id,
              preRequisiteId: insertPrerequisite.courseId,
            },
          });
        }
      );
    }

    return result;
  });

  if (updatedCourse) {
    const responseData = await prisma.course.findUnique({
      where: {
        id: updatedCourse.id,
      },
      include: {
        preRequisite: {
          include: {
            preRequisite: true,
          },
        },
        preRequisiteFor: {
          include: {
            course: true,
          },
        },
      },
    });

    return responseData;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update course');
};

const deleteCourse = async (id: string): Promise<Course | null> => {
  const deletedCourse = await prisma.$transaction(async txnClient => {
    await txnClient.courseToPrerequisite.deleteMany({
      where: {
        OR: [
          {
            courseId: id,
          },
          {
            preRequisiteId: id,
          },
        ],
      },
    });

    const result = await txnClient.course.delete({
      where: {
        id,
      },
      include: {
        preRequisite: {
          include: {
            preRequisite: true,
          },
        },
        preRequisiteFor: {
          include: {
            course: true,
          },
        },
      },
    });

    return result;
  });

  if (deletedCourse) {
    return deletedCourse;
  } else {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong'
    );
  }
};

const assignFaculties = async (
  id: string,
  payload: string[]
): Promise<CourseFaculty[]> => {
  await prisma.courseFaculty.createMany({
    data: payload.map(facultyId => ({
      courseId: id,
      facultyId: facultyId,
    })),
  });

  const assignedFacultyData = await prisma.courseFaculty.findMany({
    where: {
      courseId: id,
    },
    include: {
      faculty: true,
    },
  });

  return assignedFacultyData;
};

const removeFaculties = async (
  id: string,
  payload: string[]
): Promise<CourseFaculty[] | null> => {
  await prisma.courseFaculty.deleteMany({
    where: {
      courseId: id,
      facultyId: {
        in: payload,
      },
    },
  });

  const assignedFacultyData = await prisma.courseFaculty.findMany({
    where: {
      courseId: id,
    },
    include: {
      faculty: true,
    },
  });

  return assignedFacultyData;
};

export const CourseService = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
  assignFaculties,
  removeFaculties,
};
