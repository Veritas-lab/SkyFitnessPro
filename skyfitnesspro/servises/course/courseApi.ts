import { coursesApi, usersApi } from '@/lib/api';
import { Course, User } from '@/lib/types';

export const getCourses = async (): Promise<Course[]> => {
  const response = await coursesApi.getAll();
  return response.data;
};

export const getCoursesId = async (courseId: string): Promise<Course> => {
  const response = await coursesApi.getById(courseId);
  return response.data;
};

export const getCoursesMe = async (token: string): Promise<{ user: User }> => {
  const response = await usersApi.getMe();
  return { user: response.data };
};
