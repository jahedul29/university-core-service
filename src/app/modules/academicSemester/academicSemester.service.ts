import { AcademicSemester, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { RedisClient } from '../../../shared/redis';
import {
  EVENT_ACADEMIC_SEMESTER_CREATED,
  EVENT_ACADEMIC_SEMESTER_DELETED,
  EVENT_ACADEMIC_SEMESTER_UPDATED,
  academicSemesterSearchableFields,
  academicSemesterTitleCodeMapper,
} from './academicSemester.constants';
import { IAcademicSemesterFilterRequest } from './academicSemester.interface';

const createAcademicSemester = async (
  data: AcademicSemester
): Promise<AcademicSemester> => {
  // if (academicSemesterTitleCodeMapper[data.title] !== data.code) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid semester code');
  // }

  const isExist = await prisma.academicSemester.findFirst({
    where: {
      AND: [
        {
          title: data.title,
        },
        {
          year: data.year,
        },
      ],
    },
  });

  if (isExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Academic semester already exist'
    );
  }

  data.code = academicSemesterTitleCodeMapper[data.title];

  const result = await prisma.academicSemester.create({
    data,
  });

  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_SEMESTER_CREATED,
      JSON.stringify(result)
    );
  }
  return result;
};

const getAllSemesters = async (
  filters: IAcademicSemesterFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<AcademicSemester[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: academicSemesterSearchableFields.map(field => ({
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

  const whereConditions: Prisma.AcademicSemesterWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const result = await prisma.academicSemester.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.academicSemester.count({
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

const getSingleSemester = async (
  id: string
): Promise<AcademicSemester | null> => {
  const result = await prisma.academicSemester.findUnique({
    where: {
      id,
    },
  });

  return result;
};

const updateAcademicSemester = async (
  id: string,
  payload: Partial<AcademicSemester>
): Promise<AcademicSemester> => {
  const result = await prisma.academicSemester.update({
    where: {
      id,
    },
    data: payload,
  });

  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_SEMESTER_UPDATED,
      JSON.stringify(result)
    );
  }

  return result;
};

const deleteAcademicSemester = async (
  id: string
): Promise<AcademicSemester> => {
  const result = await prisma.academicSemester.delete({
    where: {
      id,
    },
  });

  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_SEMESTER_DELETED,
      JSON.stringify(result)
    );
  }

  return result;
};

export const AcademicSemesterService = {
  createAcademicSemester,
  getAllSemesters,
  getSingleSemester,
  updateAcademicSemester,
  deleteAcademicSemester,
};
