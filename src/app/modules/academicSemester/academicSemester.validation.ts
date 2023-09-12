import { z } from 'zod';

const createValidation = z.object({
  body: z.object({
    year: z.number({
      required_error: 'Year is required',
    }),
    title: z
      .string({
        required_error: 'Title is required',
      })
      .trim()
      .min(1, { message: 'Title is required' }),
    code: z
      .string({
        required_error: 'Code is required',
      })
      .trim()
      .min(1, { message: 'Code is required' }),
    startMonth: z
      .string({
        required_error: 'Start month is required',
      })
      .trim()
      .min(1, { message: 'Start month is required' }),
    endMonth: z
      .string({
        required_error: 'End month is required',
      })
      .trim()
      .min(1, { message: 'End month is required' }),
  }),
});

const updateValidation = z.object({
  body: z.object({
    year: z.number(),
    title: z.string().trim().optional(),
    code: z.string().trim().optional(),
    startMonth: z.string().trim().optional(),
    endMonth: z.string().trim().optional(),
  }),
});

export const AcademicSemesterValidation = {
  createValidation,
  updateValidation,
};
