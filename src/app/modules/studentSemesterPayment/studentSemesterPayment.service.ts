import { Prisma, PrismaClient, StudentSemesterPayment } from '@prisma/client';
import {
  DefaultArgs,
  PrismaClientOptions,
} from '@prisma/client/runtime/library';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import {
  studentSemesterPaymentRelationalFields,
  studentSemesterPaymentRelationalFieldsMapper,
  studentSemesterPaymentSearchableFields,
} from './studentSemesterPayment.constants';
import { IStudentSemesterPaymentFilterRequest } from './studentSemesterPayment.interface';

const createStudentSemesterPayment = async (
  prismaClient: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  payload: {
    studentId: string;
    academicSemesterId: string;
    fullPaymentAmount: number;
  }
) => {
  const isExist = await prismaClient.studentSemesterPayment.findFirst({
    where: {
      studentId: payload.studentId,
      academicSemesterId: payload.academicSemesterId,
    },
  });

  if (!isExist) {
    await prismaClient.studentSemesterPayment.create({
      data: {
        studentId: payload.studentId,
        academicSemesterId: payload.academicSemesterId,
        fullPaymentAmount: payload.fullPaymentAmount,
        totalDueAmount: payload.fullPaymentAmount,
        partialPaidAmount: payload.fullPaymentAmount * 0.5,
        totalPaidAmount: 0,
      },
    });
  }
};

const getAllStudentSemesterPayments = async (
  filters: IStudentSemesterPaymentFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<StudentSemesterPayment[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: studentSemesterPaymentSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => {
        if (studentSemesterPaymentRelationalFields.includes(key)) {
          return {
            [studentSemesterPaymentRelationalFieldsMapper[key]]: {
              id: (filterData as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditions: Prisma.StudentSemesterPaymentWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const result = await prisma.studentSemesterPayment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      student: true,
      academicSemester: true,
    },
  });

  const total = await prisma.studentSemesterPayment.count({
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

export const StudentSemesterPaymentService = {
  createStudentSemesterPayment,
  getAllStudentSemesterPayments,
};
