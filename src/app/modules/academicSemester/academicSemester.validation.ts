import { z } from 'zod';
import {
  academicSemesterCodes,
  academicSemesterTitles,
  monthList,
} from './academicSemester.constants';

const createValidation = z.object({
  body: z.object({
    year: z.number({
      required_error: 'Year is required',
    }),
    title: z.enum([...academicSemesterTitles] as [string, ...string[]], {
      required_error: 'Title is required',
    }),
    startMonth: z.enum([...monthList] as [string, ...string[]], {
      required_error: 'Start month is required',
    }),
    endMonth: z.enum([...monthList] as [string, ...string[]], {
      required_error: 'End month is required',
    }),
  }),
});

const updateValidation = z.object({
  body: z.object({
    year: z.number(),
    title: z
      .enum([...academicSemesterTitles] as [string, ...string[]])
      .optional(),
    code: z
      .enum([...academicSemesterCodes] as [string, ...string[]])
      .optional(),
    startMonth: z.enum([...monthList] as [string, ...string[]]).optional(),
    endMonth: z.enum([...monthList] as [string, ...string[]]).optional(),
  }),
});

export const AcademicSemesterValidation = {
  createValidation,
  updateValidation,
};
