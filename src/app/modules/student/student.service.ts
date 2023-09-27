import { Prisma, Student, StudentEnrolledCourseStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { studentSearchableFields } from './student.constants';
import { IStudentFilterRequest } from './student.interface';
import { StudentUtils } from './student.utils';

const createStudent = async (data: Student): Promise<Student> => {
  const result = await prisma.student.create({
    data,
  });
  return result;
};

const getAllStudents = async (
  filters: IStudentFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Student[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: studentSearchableFields.map(field => ({
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

  const whereConditions: Prisma.StudentWhereInput = andConditions.length
    ? { AND: andConditions }
    : {};

  const result = await prisma.student.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      academicSemester: true,
      academicDepartment: true,
      academicFaculty: true,
    },
  });

  const total = await prisma.student.count({
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

const getSingleStudent = async (id: string): Promise<Student | null> => {
  const result = await prisma.student.findUnique({
    where: {
      id,
    },
    include: {
      academicSemester: true,
      academicDepartment: true,
      academicFaculty: true,
    },
  });

  return result;
};

const updateStudent = async (
  id: string,
  payload: Partial<Student>
): Promise<Student> => {
  const result = await prisma.student.update({
    where: {
      id,
    },
    include: {
      academicSemester: true,
      academicDepartment: true,
      academicFaculty: true,
    },
    data: payload,
  });
  return result;
};

const deleteStudent = async (id: string): Promise<Student> => {
  const result = await prisma.student.delete({
    where: {
      id,
    },
    include: {
      academicSemester: true,
      academicDepartment: true,
      academicFaculty: true,
    },
  });
  return result;
};

const myCourses = async (
  userId: string,
  filter: {
    academicSemesterId?: string;
    courseId?: string;
  }
) => {
  if (!filter.academicSemesterId) {
    const currentSemester = await prisma.academicSemester.findFirst({
      where: {
        isCurrent: true,
      },
    });

    if (!currentSemester) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'No semester running currently!'
      );
    }

    filter.academicSemesterId = currentSemester?.id;
  } else {
    const academicSemester = await prisma.academicSemester.findFirst({
      where: {
        id: filter.academicSemesterId,
      },
    });

    if (!academicSemester) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'academic semester not found!'
      );
    }
  }

  const enrolledCourses = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        studentId: userId,
      },
      ...filter,
    },
    include: {
      student: true,
      course: true,
      academicSemester: true,
    },
  });

  return enrolledCourses;
};

const myCourseSchedules = async (
  userId: string,
  filter: {
    academicSemesterId?: string;
    courseId?: string;
  }
) => {
  if (!filter.academicSemesterId) {
    const currentSemester = await prisma.academicSemester.findFirst({
      where: {
        isCurrent: true,
      },
    });

    if (!currentSemester) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'No semester running currently!'
      );
    }

    filter.academicSemesterId = currentSemester?.id;
  } else {
    const academicSemester = await prisma.academicSemester.findFirst({
      where: {
        id: filter.academicSemesterId,
      },
    });

    if (!academicSemester) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'academic semester not found!'
      );
    }
  }

  const studentEnrolledCourses = await myCourses(userId, filter);

  const studentEnrolledCourseIds = studentEnrolledCourses.map(
    (item: any) => item.courseId
  );

  const result = await prisma.studentSemesterRegistrationCourse.findMany({
    where: {
      student: {
        studentId: userId,
      },
      semesterRegistration: {
        academicSemester: {
          id: filter.academicSemesterId,
        },
      },
      offeredCourse: {
        course: {
          id: {
            in: studentEnrolledCourseIds,
          },
        },
      },
    },
    include: {
      offeredCourse: {
        include: {
          course: true,
        },
      },
      offeredCourseSection: {
        include: {
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
      },
    },
  });

  return result;
};

const myAcademicInfo = async (userId: string): Promise<any> => {
  const academicInfo = await prisma.studentAcademicInfo.findFirst({
    where: {
      student: {
        studentId: userId,
      },
    },
  });

  if (!academicInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Academic info not found');
  }

  const enrolledCourse = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        studentId: userId,
      },
      status: StudentEnrolledCourseStatus.COMPLETED,
    },
    include: {
      course: true,
      academicSemester: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const groupByAcademicSemester =
    StudentUtils.groupByAcademicSemester(enrolledCourse);

  return {
    academicInfo,
    courses: groupByAcademicSemester,
  };
};

export const StudentService = {
  createStudent,
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
  myCourses,
  myCourseSchedules,
  myAcademicInfo,
};
