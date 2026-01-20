import axios from 'axios';
import { BASE_URL } from './constants';
import {
  CourseTypes,
  ProgressWorkOutTypes,
  UserTypes,
  WorkOutTypes,
} from '@/sharedTyres/shared.Types';

interface authUserForm {
  email: string;
  password: string;
}

interface TokenType {
  token: string;
}

export const getToken = async ({
  email,
  password,
}: authUserForm): Promise<TokenType> => {
  const res = await axios.post(
    BASE_URL + '/auth/login',
    { email, password },
  );
  const token = res.data;
  return token;
};

export const getCourses = async (): Promise<CourseTypes[]> => {
  const res = await axios.get(BASE_URL + '/courses');
  return res.data;
};

export const getCoursesMe = async (token: string): Promise<{ user: UserTypes }> => {
  const res = await axios.get(BASE_URL + '/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { user: res.data };
};

export const getCoursesId = async (courseId: string): Promise<CourseTypes> => {
  const res = await axios.get(BASE_URL + `/courses/${courseId}`);
  return res.data;
};

export const addCourseAPI = (token: string, courseId: string) => {
  return axios.post(
    BASE_URL + '/users/me/courses',
    { courseId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};

export const removeCourseAPI = (token: string, courseId: string) => {
  return axios.delete(BASE_URL + `/users/me/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Получить список тренировок курса
export const getWorkOutId = async (
  workoutId: string,
  token: string,
): Promise<WorkOutTypes> => {
  const res = await axios.get(BASE_URL + `/workouts/${workoutId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Получить данные по тренировке
export const getWorkOutList = async (
  courseId: string,
  token: string,
): Promise<WorkOutTypes[]> => {
  const res = await axios.get(
    BASE_URL + `/courses/${courseId}/workouts`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

// Удалить весь прогресс по курсу
export const removeCourseProgress = (token: string, courseId: string) => {
  return axios.patch(
    BASE_URL + `/courses/${courseId}/reset`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};

// Получить прогресс пользователя по всему курсу
export const getProgressCourse = async (
  courseId: string,
  token: string,
): Promise<ProgressWorkOutTypes> => {
  const res = await axios.get(
    BASE_URL + `/users/me/progress?courseId=${courseId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

// Получить прогресс пользователя по тренировке
export const getProgressTrain = async (
  workoutId: string,
  courseId: string,
  token: string,
): Promise<ProgressWorkOutTypes> => {
  const res = await axios.get(
    BASE_URL +
      `/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};

// Сохранить прогресс тренировки
export const saveTrainProgress = (
  token: string,
  courseId: string,
  workoutId: string,
  progressPayload: { progressData: number[] },
): Promise<ProgressWorkOutTypes> => {
  return axios.patch(
    BASE_URL + `/courses/${courseId}/workouts/${workoutId}`,
    progressPayload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};

// Удалить весь прогресс по тренировке
export const deleteAllCourseProgress = (
  token: string,
  courseId: string,
  workoutId: string,
) => {
  return axios.patch(
    BASE_URL + `/courses/${courseId}/workouts/${workoutId}/reset`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};