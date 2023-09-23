import {
  ExamType,
  PrismaClient,
  StudentEnrolledCourseMark,
  StudentEnrolledCourseStatus,
} from '@prisma/client';
import {
  DefaultArgs,
  PrismaClientOptions,
} from '@prisma/client/runtime/library';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { IStudentEnrolledCourseMarkFilterRequest } from './studentEnrolledCourseMark.interface';
import { StudentEnrolledCourseMarkUtils } from './studentEnrolledCourseMark.utils';

const createStudentEnrolledDefaultCourseMark = async (
  prismaClient: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  payload: {
    studentId: string;
    academicSemesterId: string;
    studentEnrolledCourseId: string;
  }
) => {
  const isExistMidTermData =
    await prismaClient.studentEnrolledCourseMark.findFirst({
      where: {
        studentId: payload.studentId,
        academicSemesterId: payload.academicSemesterId,
        studentEnrolledCourseId: payload.studentEnrolledCourseId,
        examType: ExamType.MIDTERM,
      },
    });

  if (!isExistMidTermData) {
    await prismaClient.studentEnrolledCourseMark.create({
      data: {
        studentId: payload.studentId,
        academicSemesterId: payload.academicSemesterId,
        studentEnrolledCourseId: payload.studentEnrolledCourseId,
        examType: ExamType.MIDTERM,
      },
    });
  }

  const isExistFinalData =
    await prismaClient.studentEnrolledCourseMark.findFirst({
      where: {
        studentId: payload.studentId,
        academicSemesterId: payload.academicSemesterId,
        studentEnrolledCourseId: payload.studentEnrolledCourseId,
        examType: ExamType.FINAL,
      },
    });

  if (!isExistFinalData) {
    await prismaClient.studentEnrolledCourseMark.create({
      data: {
        studentId: payload.studentId,
        academicSemesterId: payload.academicSemesterId,
        studentEnrolledCourseId: payload.studentEnrolledCourseId,
        examType: ExamType.FINAL,
      },
    });
  }
};

const getAllStudentEnrolledCourseMarks = async (
  filters: IStudentEnrolledCourseMarkFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<StudentEnrolledCourseMark[]>> => {
  const { limit, page } = paginationHelpers.calculatePagination(options);

  const marks = await prisma.studentEnrolledCourseMark.findMany({
    where: {
      student: {
        id: filters.studentId,
      },
      academicSemester: {
        id: filters.academicSemesterId,
      },
      studentEnrolledCourse: {
        course: {
          id: filters.courseId,
        },
      },
    },
    include: {
      studentEnrolledCourse: {
        include: {
          course: true,
        },
      },
      student: true,
    },
  });

  return {
    meta: {
      total: marks.length,
      page,
      limit,
    },
    data: marks,
  };
};

const updateMarks = async (payload: {
  studentId: string;
  academicSemesterId: string;
  courseId: string;
  examType: ExamType;
  marks: number;
}): Promise<StudentEnrolledCourseMark> => {
  const studentEnrolledCourseMark =
    await prisma.studentEnrolledCourseMark.findFirst({
      where: {
        studentId: payload.studentId,
        academicSemesterId: payload.academicSemesterId,
        studentEnrolledCourse: {
          course: {
            id: payload.courseId,
          },
        },
        examType: payload.examType,
      },
    });

  if (!studentEnrolledCourseMark) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Student Enrolled course mark not found'
    );
  }

  const result = await prisma.studentEnrolledCourseMark.update({
    where: {
      id: studentEnrolledCourseMark.id,
    },
    data: {
      marks: payload.marks,
      grade: StudentEnrolledCourseMarkUtils.calculateGrade(payload.marks).grade,
    },
  });

  return result;
};

const updateFinalMarks = async (payload: {
  studentId: string;
  academicSemesterId: string;
  courseId: string;
}) => {
  const { studentId, academicSemesterId, courseId } = payload;
  const studentEnrolledCourse = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        id: studentId,
      },
      academicSemester: {
        id: academicSemesterId,
      },
      course: {
        id: courseId,
      },
    },
  });

  if (studentEnrolledCourse.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Student enrolled course not found!'
    );
  }

  const studentEnrolledCourseMarks =
    await prisma.studentEnrolledCourseMark.findMany({
      where: {
        student: {
          id: studentId,
        },
        academicSemester: {
          id: academicSemesterId,
        },
        studentEnrolledCourse: {
          course: {
            id: courseId,
          },
        },
      },
    });

  if (studentEnrolledCourseMarks.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Student not enrolled in any course!'
    );
  }

  const midTermMark =
    studentEnrolledCourseMarks.find(item => item.examType === ExamType.MIDTERM)
      ?.marks || 0;
  const finalMark =
    studentEnrolledCourseMarks.find(item => item.examType === ExamType.FINAL)
      ?.marks || 0;

  const totalMarks = midTermMark * 0.4 + finalMark * 0.6;

  const result = StudentEnrolledCourseMarkUtils.calculateGrade(totalMarks);

  await prisma.studentEnrolledCourse.updateMany({
    where: {
      student: {
        id: studentId,
      },
      academicSemester: {
        id: academicSemesterId,
      },
      course: {
        id: courseId,
      },
    },
    data: {
      grade: result.grade,
      point: result.point,
      totoalMarks: totalMarks,
      status: StudentEnrolledCourseStatus.COMPLETED,
    },
  });

  const completedCourses = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        id: studentId,
      },
      academicSemester: {
        id: academicSemesterId,
      },
      course: {
        id: courseId,
      },
      status: StudentEnrolledCourseStatus.COMPLETED,
    },
    include: {
      course: true,
    },
  });

  if (completedCourses.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'This student still not completed any course'
    );
  }

  const finalResult =
    StudentEnrolledCourseMarkUtils.calculateFinalResult(completedCourses);

  const isExistStudentInfo = await prisma.studentAcademicInfo.findFirst({
    where: {
      studentId: studentId,
    },
  });

  if (isExistStudentInfo) {
    await prisma.studentAcademicInfo.update({
      where: {
        id: isExistStudentInfo.id,
      },
      data: {
        studentId,
        totalCompletedCredit: finalResult.totalCompletedCredit,
        cgpa: finalResult.cgpa,
      },
    });
  } else {
    await prisma.studentAcademicInfo.create({
      data: {
        studentId,
        totalCompletedCredit: finalResult.totalCompletedCredit,
        cgpa: finalResult.cgpa,
      },
    });
  }

  return completedCourses;
};

export const StudentEnrolledCourseMarkService = {
  createStudentEnrolledDefaultCourseMark,
  getAllStudentEnrolledCourseMarks,
  updateMarks,
  updateFinalMarks,
};
