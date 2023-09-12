import { z } from 'zod';

const createValidation = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
      })
      .trim()
      .min(1, { message: 'Title is required' }),
    academicFacultyId: z
      .string({
        required_error: 'Academic faculty id is required',
      })
      .trim()
      .min(1, { message: 'Academic faculty id is required' }),
  }),
});

const updateValidation = z.object({
  body: z.object({
    title: z.string().trim().optional(),
    academicFacultyId: z.string().trim().optional(),
  }),
});

export const AcademicDepartmentValidation = {
  createValidation,
  updateValidation,
};
