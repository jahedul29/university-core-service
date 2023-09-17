import { SemesterRegistrationStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const enrollIntoCourse = async (
  userId: string,
  payload: { offeredCourseId: string; offeredCourseSectionId: string }
) => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
  });
  if (!semesterRegistration) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'No semester registration going on!'
    );
  }

  const offeredCourse = await prisma.offeredCourse.findFirst({
    where: {
      id: payload.offeredCourseId,
    },
    include: {
      course: true,
    },
  });
  if (!offeredCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No offered course found!');
  }

  const offeredCourseSection = await prisma.offeredCourseSection.findFirst({
    where: {
      id: payload.offeredCourseSectionId,
    },
  });
  if (!offeredCourseSection) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'No offered course section found!'
    );
  }

  const student = await prisma.student.findFirst({
    where: {
      studentId: userId,
    },
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found!');
  }

  await prisma.$transaction(async txnClient => {
    await txnClient.studentSemesterRegistrationCourse.create({
      data: {
        semesterRegistrationId: semesterRegistration.id,
        studentId: student.id,
        offeredCourseId: offeredCourse.id,
        offeredCourseSectionId: offeredCourseSection.id,
      },
    });

    const updatedOfferedCourseSection =
      await txnClient.offeredCourseSection.update({
        where: {
          id: offeredCourseSection.id,
        },
        data: {
          currentlyEnrolledStudent: {
            increment: 1,
          },
        },
      });

    if (
      updatedOfferedCourseSection.maxCapacity &&
      updatedOfferedCourseSection.currentlyEnrolledStudent &&
      updatedOfferedCourseSection.currentlyEnrolledStudent >=
        updatedOfferedCourseSection.maxCapacity
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This section is out of it's capacity"
      );
    }

    await txnClient.studentSemesterRegistration.updateMany({
      where: {
        student: {
          id: student.id,
        },
        semesterRegistration: {
          id: semesterRegistration.id,
        },
      },
      data: {
        totalCreditsTaken: {
          increment: offeredCourse.course.credits,
        },
      },
    });
  });

  return {
    message: 'Successfully enrolled into course',
  };
};

const withdrawFromCourse = async (
  userId: string,
  payload: { offeredCourseId: string; offeredCourseSectionId: string }
) => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
  });
  if (!semesterRegistration) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'No semester registration going on!'
    );
  }

  const offeredCourse = await prisma.offeredCourse.findFirst({
    where: {
      id: payload.offeredCourseId,
    },
    include: {
      course: true,
    },
  });
  if (!offeredCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No offered course found!');
  }

  const student = await prisma.student.findFirst({
    where: {
      studentId: userId,
    },
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found!');
  }

  await prisma.$transaction(async txnClient => {
    await txnClient.studentSemesterRegistrationCourse.delete({
      where: {
        semesterRegistrationId_studentId_offeredCourseId: {
          semesterRegistrationId: semesterRegistration.id,
          studentId: student.id,
          offeredCourseId: offeredCourse.id,
        },
      },
    });

    await txnClient.offeredCourseSection.update({
      where: {
        id: payload.offeredCourseSectionId,
      },
      data: {
        currentlyEnrolledStudent: {
          decrement: 1,
        },
      },
    });

    await txnClient.studentSemesterRegistration.updateMany({
      where: {
        student: {
          id: student.id,
        },
        semesterRegistration: {
          id: semesterRegistration.id,
        },
      },
      data: {
        totalCreditsTaken: {
          decrement: offeredCourse.course.credits,
        },
      },
    });
  });

  return {
    message: 'Successfully withdraw from course',
  };
};

export const semesterStudentRegistrationCourseService = {
  enrollIntoCourse,
  withdrawFromCourse,
};
