import { WeekDays } from '@prisma/client';
import { z } from 'zod';

const createValidation = z.object({
  body: z.object({
    dayOfWeek: z.enum([...Object.values(WeekDays)] as [string, ...string[]], {
      required_error: 'dayOfWeek Id is required',
    }),
    startTime: z
      .string({
        required_error: 'start time is required',
      })
      .trim()
      .min(1, { message: 'First name is required' }),
    endTime: z
      .string({
        required_error: 'start time is required',
      })
      .trim()
      .min(1, { message: 'First name is required' }),

    offeredCourseSectionId: z
      .string({
        required_error: 'offeredCourseSectionId is required',
      })
      .trim()
      .min(1, { message: 'offeredCourseSectionId is required' }),
    roomId: z
      .string({
        required_error: 'roomId is required',
      })
      .trim()
      .min(1, { message: 'roomId is required' }),
    facultyId: z
      .string({
        required_error: 'facultyId is required',
      })
      .trim()
      .min(1, { message: 'facultyId is required' }),
  }),
});

const updateValidation = z.object({
  body: z.object({
    dayOfWeek: z
      .enum([...Object.values(WeekDays)] as [string, ...string[]])
      .optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    offeredCourseSectionId: z.string().optional(),
    roomId: z.string().optional(),
    facultyId: z.string().optional(),
  }),
});

export const OfferedCourseClassScheduleValidation = {
  createValidation,
  updateValidation,
};
