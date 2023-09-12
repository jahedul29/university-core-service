import { z } from 'zod';

const createValidation = z.object({
  body: z.object({
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
    credits: z
      .number({
        required_error: 'Credits is required',
      })
      .min(1, { message: 'Credits is required' }),
  }),
});

const updateValidation = z.object({
  body: z.object({
    title: z.string().trim().optional(),
    code: z.string().trim().optional(),
    credits: z.number().optional(),
  }),
});

const assignOrRemoveFaculties = z.object({
  body: z.object({
    courses: z.array(z.string(), {
      required_error: 'faculties are required',
    }),
  }),
});

export const CourseValidation = {
  createValidation,
  updateValidation,
  assignOrRemoveFaculties,
};
