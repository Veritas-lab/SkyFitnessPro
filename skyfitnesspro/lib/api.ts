import axios from 'axios';
import { Course, Workout, User, CourseProgress, WorkoutProgress } from './types';

const api = axios.create({
  baseURL: '/api/fitness',
  timeout: 10000, // 10 секунд таймаут для запросов
});

// Interceptor для token и удаления Content-Type
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  // Удаляем Content-Type, так как API не поддерживает этот заголовок
  if (config.headers['Content-Type']) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Interceptor для обработки ошибок ответа
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если получили 401, очищаем токен
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth
// Согласно документации API:
// POST /api/fitness/auth/register - регистрация
// POST /api/fitness/auth/login - авторизация
// Ошибки возвращаются с кодом 404 в формате { "message": "..." }
export const authApi = {
  register: (email: string, password: string) =>
    api.post<{ message: string }>('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post<{ token: string }>('/auth/login', { email, password }),
};

// Users
export const usersApi = {
  getMe: () => api.get<User>('/users/me'),
  addCourse: (courseId: string) => {
    // Убеждаемся, что отправляем правильный формат данных
    return api.post('/users/me/courses', { courseId });
  },
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