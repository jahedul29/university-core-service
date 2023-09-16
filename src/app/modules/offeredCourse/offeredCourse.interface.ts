export type IOfferedCourseFilterRequest = {
  searchTerm?: string;
};

export type IOfferedCourseRequestData = {
  academicDepartmentId: string;
  semesterRegistrationId: string;
  courseIds: string[];
};
