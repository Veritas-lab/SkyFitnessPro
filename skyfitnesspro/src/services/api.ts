import axios from 'axios';
import { Course, Workout, Progress, User } from '../types';

const API_BASE_URL = 'https://api.sky.pro/api/fitness'; // Из задания

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data: { email: string; password: string }) =>
  api.post<{ message: string }>('/auth/register', data);
export const login = (data: { email: string; password: string }) =>
  api.post<{ token: string }>('/auth/login', data);

// User
export const getUser = (): Promise<{ data: User }> => api.get('/users/me');

// Courses
export const getCourses = (): Promise<{ data: Course[] }> => api.get('/courses');
export const getCourse = (id: string): Promise<{ data: Course }> =>
  api.get(`/courses/${id}`);
export const addCourse = (courseId: string) =>
  api.post('/users/me/courses', { courseId });
export const removeCourse = (courseId: string) =>
  api.delete(`/users/me/courses/${courseId}`);

// Workouts
export const getWorkouts = (courseId: string) =>
  api.get<Workout[]>(`/courses/${courseId}/workouts`);

// Progress
export const getProgress = (courseId: string) =>
  api.get<Progress[]>(`/users/me/progress?courseId=${courseId}`);
export const updateProgress = (
  courseId: string,
  workoutId: string,
  progressData: number[]
) => api.patch(`/courses/${courseId}/workouts/${workoutId}`, { progressData });

export default api;