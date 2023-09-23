import { Course, StudentEnrolledCourse } from '@prisma/client';

const calculateGrade = (marks: number): { grade: string; point: number } => {
  let result = {
    grade: '',
    point: 0.0,
  };

  if (marks >= 0 && marks <= 39) {
    result = {
      grade: 'F',
      point: 0.0,
    };
  } else if (marks >= 40 && marks <= 49) {
    result = {
      grade: 'B',
      point: 2.5,
    };
  } else if (marks >= 50 && marks <= 59) {
    result = {
      grade: 'C',
      point: 3.0,
    };
  } else if (marks >= 60 && marks <= 69) {
    result = {
      grade: 'A-',
      point: 3.5,
    };
  } else if (marks >= 70 && marks <= 79) {
    result = {
      grade: 'A',
      point: 3.75,
    };
  } else if (marks >= 80 && marks <= 100) {
    result = {
      grade: 'A+',
      point: 4.0,
    };
  }

  return result;
};

const calculateFinalResult = (
  payload: (StudentEnrolledCourse & { course: Course })[]
) => {
  let totalCredits = 0;
  let totalCGPA = 0;

  for (const grade of payload) {
    totalCredits += grade?.course.credits || 0;
    totalCGPA += grade?.point || 0;
  }

  const avgCgpa = totalCGPA / payload.length;

  return {
    totalCompletedCredit: totalCredits,
    cgpa: avgCgpa,
  };
};

export const StudentEnrolledCourseMarkUtils = {
  calculateGrade,
  calculateFinalResult,
};
