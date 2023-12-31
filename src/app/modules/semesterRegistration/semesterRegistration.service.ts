import {
  Course,
  OfferedCourse,
  Prisma,
  SemesterRegistration,
  SemesterRegistrationStatus,
  StudentEnrolledCourseStatus,
  StudentSemesterRegistration,
  StudentSemesterRegistrationCourse,
} from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { asyncForEach } from '../../../shared/utils';
import { semesterStudentRegistrationCourseService } from '../semesterStudentRegistrationCourse/semesterStudentRegistrationCourse.service';
import { StudentEnrolledCourseMarkService } from '../studentEnrolledCourseMark/studentEnrolledCourseMark.service';
import { StudentSemesterPaymentService } from '../studentSemesterPayment/studentSemesterPayment.service';
import { semesterRegistrationSearchableFields } from './semesterRegistration.constants';
import { ISemesterRegistrationFilterRequest } from './semesterRegistration.interface';
import { SemesterRegistrationUtils } from './semesterRegistration.utils';

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
    include: {
      academicSemester: true,
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
      include: {
        student: true,
      },
    });

  return { semesterRegistration, studentSemesterRegistration };
};

const startNewSemester = async (
  id: string
): Promise<{
  message: string;
}> => {
  const semesterRegistration = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
  });
  if (!semesterRegistration) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Semester registration not found');
  }
  if (semesterRegistration.academicSemester.isCurrent) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'This academic semester is already running'
    );
  }
  if (semesterRegistration.status !== SemesterRegistrationStatus.ENDED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'This semester registration not ended yet'
    );
  }

  await prisma.$transaction(async transactionClient => {
    await transactionClient.academicSemester.updateMany({
      where: {
        isCurrent: true,
      },
      data: {
        isCurrent: false,
      },
    });

    await transactionClient.academicSemester.update({
      where: {
        id: semesterRegistration.academicSemester.id,
      },
      data: {
        isCurrent: true,
      },
    });

    const studentSemesterRegistrations =
      await transactionClient.studentSemesterRegistration.findMany({
        where: {
          semesterRegistration: {
            id,
          },
          isConfirmed: true,
        },
      });

    await asyncForEach(
      studentSemesterRegistrations,
      async (studentSemesterReg: StudentSemesterRegistration) => {
        const studentSemesterRegistrationCourses =
          await transactionClient.studentSemesterRegistrationCourse.findMany({
            where: {
              semesterRegistration: {
                id,
              },
              student: {
                id: studentSemesterReg.studentId,
              },
            },
            include: {
              offeredCourse: {
                include: {
                  course: true,
                },
              },
            },
          });

        await asyncForEach(
          studentSemesterRegistrationCourses,
          async (
            studentSemRegCourse: StudentSemesterRegistrationCourse & {
              offeredCourse: OfferedCourse & {
                course: Course;
              };
            }
          ) => {
            if (
              studentSemesterReg.totalCreditsTaken ||
              studentSemesterReg.totalCreditsTaken === 0
            ) {
              const fullPaymentAmount =
                studentSemesterReg.totalCreditsTaken * 5000;

              await StudentSemesterPaymentService.createStudentSemesterPayment(
                transactionClient,
                {
                  studentId: studentSemRegCourse.studentId,
                  academicSemesterId: semesterRegistration.academicSemesterId,
                  fullPaymentAmount,
                }
              );
            }

            const alreadyEnrolledCourse =
              await transactionClient.studentEnrolledCourse.findFirst({
                where: {
                  studentId: studentSemRegCourse.studentId,
                  courseId: studentSemRegCourse.offeredCourse.course.id,
                  academicSemesterId: semesterRegistration.id,
                },
              });

            if (!alreadyEnrolledCourse) {
              const studentEnrolledCourse =
                await transactionClient.studentEnrolledCourse.create({
                  data: {
                    studentId: studentSemRegCourse.studentId,
                    courseId: studentSemRegCourse.offeredCourse.course.id,
                    academicSemesterId:
                      semesterRegistration.academicSemester.id,
                  },
                });

              await StudentEnrolledCourseMarkService.createStudentEnrolledDefaultCourseMark(
                transactionClient,
                {
                  studentId: studentEnrolledCourse.studentId,
                  academicSemesterId: studentEnrolledCourse.academicSemesterId,
                  studentEnrolledCourseId: studentEnrolledCourse.id,
                }
              );
            }
          }
        );
      }
    );
  });

  return {
    message: 'New semester started successfully',
  };
};

const getEnrollableSemesterRegistrationCourses = async (userId: string) => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: userId,
    },
  });

  const onGoingOrUpcomingSemester = await prisma.semesterRegistration.findFirst(
    {
      where: {
        status: {
          in: [
            SemesterRegistrationStatus.ONGOING,
            SemesterRegistrationStatus.UPCOMING,
          ],
        },
      },
    }
  );

  if (!onGoingOrUpcomingSemester) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'No ongoing or upcoming semester registration found'
    );
  }

  const studentsCompletedCourses = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        id: student?.id,
      },
      academicSemesterId: onGoingOrUpcomingSemester.academicSemesterId,
      status: StudentEnrolledCourseStatus.COMPLETED,
    },
    include: {
      academicSemester: true,
      course: true,
      student: true,
    },
  });

  console.log({ studentsCompletedCourses });

  const currentlyEnrolledCourses =
    await prisma.studentSemesterRegistrationCourse.findMany({
      where: {
        student: {
          id: student?.id,
        },
        semesterRegistration: {
          id: onGoingOrUpcomingSemester.id,
        },
      },
      include: {
        offeredCourse: true,
        offeredCourseSection: true,
        semesterRegistration: true,
      },
    });

  console.log({ currentlyEnrolledCourses });

  const offeredCourses = await prisma.offeredCourse.findMany({
    where: {
      academicDepartmentId: student?.academicDepartmentId,
      semesterRegistration: {
        id: onGoingOrUpcomingSemester.id,
      },
    },
    include: {
      course: {
        include: {
          preRequisite: {
            include: {
              preRequisite: true,
            },
          },
        },
      },
      academicDepartment: {
        include: {
          academicFaculty: true,
        },
      },
      semesterRegistration: {
        include: {
          academicSemester: true,
          offeredCourseClassSchedules: {
            include: {
              room: {
                include: {
                  building: true,
                },
              },
            },
          },
        },
      },
      offeredCourseSections: {
        include: {
          offeredCourse: true,
        },
      },
      studentSemesterRegistrationCourses: true,
    },
  });

  const availableCourses = SemesterRegistrationUtils.getAvailableCourses(
    offeredCourses,
    studentsCompletedCourses,
    currentlyEnrolledCourses
  );

  return availableCourses;
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
  startNewSemester,
  getEnrollableSemesterRegistrationCourses,
};
