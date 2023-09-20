const calculateGrade = (marks: number): string => {
  let grade = '';

  if (marks >= 0 && marks <= 39) {
    grade = 'F';
  } else if (marks >= 40 && marks <= 49) {
    grade = 'D';
  } else if (marks >= 50 && marks <= 59) {
    grade = 'C';
  } else if (marks >= 60 && marks <= 69) {
    grade = 'B';
  } else if (marks >= 70 && marks <= 79) {
    grade = 'A';
  } else if (marks >= 80 && marks <= 100) {
    grade = 'A+';
  }

  return grade;
};

export const StudentEnrolledCourseUtils = {
  calculateGrade,
};
