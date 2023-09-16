import { string, z } from 'zod';

const createValidation = z.object({
  body: z.object({
    academicDepartmentId: z
      .string({
        required_error: 'academicDepartment Id is required',
      })
      .trim()
      .min(1, { message: 'academicDepartment Id is required' }),
    semesterRegistrationId: z
      .string({
        required_error: 'semesterRegistration Id is required',
      })
      .trim()
      .min(1, { message: 'semesterRegistration Id is required' }),
    courseIds: z.array(
      z.string({
        required_error: 'course id is required',
      }),
      {
        required_error: 'courseIds is required',
      }
    ),
  }),
});

const updateValidation = z.object({
  body: z.object({
    academicDepartmentId: z.string().trim().optional(),
    semesterRegistrationId: z.string().trim().optional(),
    courseIds: z.array(string()).optional(),
  }),
});

export const OfferedCourseValidation = {
  createValidation,
  updateValidation,
};
