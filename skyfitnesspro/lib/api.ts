import axios from 'axios';
import { Course, Workout, User, CourseProgress, WorkoutProgress } from './types';

const api = axios.create({
  baseURL: '/api/fitness',
  timeout: 10000, // 10 секунд таймаут для запросов
});

// Interceptor для token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post<{ token: string }>('/auth/login', { email, password }),
};

// Users
export const usersApi = {
  getMe: () => api.get<User>('/users/me'),
  addCourse: (courseId: string) =>
    api.post('/users/me/courses', { courseId }),
  removeCourse: (courseId: string) =>
    api.delete(`/users/me/courses/${courseId}`),
};

// Courses
export const coursesApi = {
  getAll: () => api.get<Course[]>('/courses'),
  getById: (courseId: string) => api.get<Course>(`/courses/${courseId}`),
  getWorkouts: (courseId: string) =>
    api.get<Workout[]>(`/courses/${courseId}/workouts`),
  resetProgress: (courseId: string) =>
    api.patch(`/courses/${courseId}/reset`),
};

// Workouts
export const workoutsApi = {
  getById: (workoutId: string) => api.get<Workout>(`/workouts/${workoutId}`),
  saveProgress: (
    courseId: string,
    workoutId: string,
    progressData: number[]
  ) =>
    api.patch(`/courses/${courseId}/workouts/${workoutId}`, { progressData }),
  resetProgress: (courseId: string, workoutId: string) =>
    api.patch(`/courses/${courseId}/workouts/${workoutId}/reset`),
};

// Progress
export const progressApi = {
  getCourseProgress: (courseId: string) =>
    api.get<CourseProgress>(`/users/me/progress?courseId=${courseId}`),
  getWorkoutProgress: (courseId: string, workoutId: string) =>
    api.get<WorkoutProgress>(
      `/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`
    ),
};

export default api;