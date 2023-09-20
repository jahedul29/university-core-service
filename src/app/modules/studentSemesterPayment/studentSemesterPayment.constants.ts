export const studentSemesterPaymentSearchableFields = ['paymentStatus'];

export const studentSemesterPaymentFilterableFields = [
  'searchTerm',
  'studentId',
  'academicSemesterId',
  'paymentStatus',
];

export const studentSemesterPaymentRelationalFields = [
  'studentId',
  'academicSemesterId',
];

export const studentSemesterPaymentRelationalFieldsMapper: {
  [key: string]: string;
} = {
  studentId: 'student',
  academicSemesterId: 'academicSemester',
};
