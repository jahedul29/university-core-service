import { ExamType } from '@prisma/client';
import { z } from 'zod';

const updateMarks = z.object({
  body: z.object({
    studentId: z.string().optional(),
    academicSemesterId: z.string().optional(),
    courseId: z.string().optional(),
    examType: z
      .enum([...Object.values(ExamType)] as [string, ...string[]])
      .optional(),
    marks: z.number().optional(),
  }),
});

const updateFinalMarks = z.object({
  body: z.object({
    studentId: z.string().optional(),
    academicSemesterId: z.string().optional(),
    courseId: z.string().optional(),
  }),
});

export const StudentEnrolledCourseMarkValidation = {
  updateMarks,
  updateFinalMarks,
};
