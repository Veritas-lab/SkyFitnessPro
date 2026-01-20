import { coursesApi } from '@/lib/api';
import { Course } from '@/lib/types';

export const getCourses = async (): Promise<Course[]> => {
  const response = await coursesApi.getAll();
  return response.data;
};

export const getCoursesId = async (courseId: string): Promise<Course> => {
  const response = await coursesApi.getById(courseId);
  return response.data;
};
