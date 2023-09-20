export const studentEnrolledCourseSearchableFields = ['status', 'grade'];

export const studentEnrolledCourseFilterableFields = [
  'searchTerm',
  'studentId',
  'courseId',
  'academicSemesterId',
  'grade',
  'points',
  'status',
];

export const studentEnrolledCourseRelationalFields = [
  'studentId',
  'courseId',
  'academicSemesterId',
];

export const studentEnrolledCourseRelationalFieldsMapper: {
  [key: string]: string;
} = {
  studentId: 'student',
  courseId: 'course',
  academicSemesterId: 'academicSemester',
};
