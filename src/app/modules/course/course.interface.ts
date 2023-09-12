export type ICourseRequestData = {
  title: string;
  code: string;
  credits: number;
  prerequisiteCourses: IPrerequisiteCourseRequest[];
};

export type IPrerequisiteCourseRequest = {
  courseId: string;
  isDeleted?: boolean;
};

export type ICourseFilterRequest = {
  searchTerm?: string;
};
