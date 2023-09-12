import { z } from 'zod';
import { bloodGroupList, genderList } from '../../../constants/common';

const createValidation = z.object({
  body: z.object({
    facultyId: z
      .string({
        required_error: 'Faculty Id is required',
      })
      .trim()
      .min(1, { message: 'Faculty Id is required' }),
    firstName: z
      .string({
        required_error: 'First name is required',
      })
      .trim()
      .min(1, { message: 'First name is required' }),
    lastName: z
      .string({
        required_error: 'Last name is required',
      })
      .trim()
      .min(1, { message: 'Last name is required' }),
    middleName: z.string().trim().optional(),
    profileImg: z.string().trim().optional(),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .refine(
        value => {
          // Regular expression for a basic email validation pattern
          const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

          return emailRegex.test(value);
        },
        {
          message: 'Invalid email address',
        }
      ),
    contactNo: z.string().trim().optional(),
    gender: z.enum([...genderList] as [string, ...string[]], {
      required_error: 'Gender is required',
    }),
    bloodGroup: z.enum([...bloodGroupList] as [string, ...string[]]).optional(),
    designation: z
      .string({
        required_error: 'Designation is required',
      })
      .trim(),
    academicDepartmentId: z
      .string({
        required_error: 'academicDepartmentId is required',
      })
      .trim()
      .min(1, { message: 'academicDepartmentId is required' }),
    academicFacultyId: z
      .string({
        required_error: 'academicFacultyId is required',
      })
      .trim()
      .min(1, { message: 'academicFacultyId is required' }),
  }),
});

const updateValidation = z.object({
  body: z.object({
    facultyId: z.string().trim().optional(),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    middleName: z.string().trim().optional(),
    profileImg: z.string().trim().optional(),
    email: z
      .string()
      .refine(
        value => {
          // Regular expression for a basic email validation pattern
          const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

          return emailRegex.test(value);
        },
        {
          message: 'Invalid email address',
        }
      )
      .optional(),
    contactNo: z.string().trim().optional(),
    gender: z.enum([...genderList] as [string, ...string[]]).optional(),
    bloodGroup: z.enum([...bloodGroupList] as [string, ...string[]]).optional(),
    designation: z.string().trim().optional(),
    academicDepartmentId: z.string().trim().optional(),
    academicFacultyId: z.string().trim().optional(),
  }),
});

const assignOrRemoveCourses = z.object({
  body: z.object({
    courses: z.array(z.string(), {
      required_error: 'courses are required',
    }),
  }),
});

export const FacultyValidation = {
  createValidation,
  updateValidation,
  assignOrRemoveCourses,
};
