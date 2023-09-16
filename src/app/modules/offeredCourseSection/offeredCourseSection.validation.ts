import { z } from 'zod';

const createValidation = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'title Id is required',
      })
      .trim()
      .min(1, { message: 'title Id is required' }),
    maxCapacity: z.number({
      required_error: 'maxCapacity Id is required',
    }),
    currentlyEnrolledStudent: z.number().optional(),
    offeredCourseId: z
      .string({
        required_error: 'offeredCourseId Id is required',
      })
      .trim()
      .min(1, { message: 'offeredCourseId Id is required' }),
  }),
});

const updateValidation = z.object({
  body: z.object({
    title: z.string().trim().optional(),
    maxCapacity: z.number().optional(),
    currentlyEnrolledStudent: z.number().optional(),
    offeredCourseId: z.string().trim().optional(),
  }),
});

export const OfferedCourseSectionValidation = {
  createValidation,
  updateValidation,
};
