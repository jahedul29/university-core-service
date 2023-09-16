import { SemesterRegistrationStatus } from '@prisma/client';
import { z } from 'zod';

const createValidation = z.object({
  body: z.object({
    startData: z
      .string({
        required_error: 'Start Date is required',
      })
      .trim()
      .min(1, { message: 'End Date is required' }),
    endDate: z
      .string({
        required_error: 'End Date is required',
      })
      .trim()
      .min(1, { message: 'Start Date is required' }),
    minCredit: z.number({
      required_error: 'Minimum Credit is required',
    }),
    maxCredit: z.number({
      required_error: 'Maximum Credit is required',
    }),
    academicSemesterId: z
      .string({
        required_error: 'academicSemesterId is required',
      })
      .trim()
      .min(1, { message: 'academicSemesterId is required' }),
  }),
});

const updateValidation = z.object({
  body: z.object({
    startData: z.string().optional(),
    endDate: z.string().optional(),
    status: z
      .enum([...Object.values(SemesterRegistrationStatus)] as [
        string,
        ...string[]
      ])
      .optional(),
    minCredit: z.number().optional(),
    maxCredit: z.number().optional(),
    academicSemesterId: z.string().optional(),
  }),
});

export const SemesterRegistrationValidation = {
  createValidation,
  updateValidation,
};
