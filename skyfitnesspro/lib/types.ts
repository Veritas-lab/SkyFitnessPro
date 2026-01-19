// lib/types.ts
import { z } from "zod"; 
export interface User {
    email: string;
    selectedCourses: string[]; // массив id курсов
  }
  
  export interface Course {
    _id: string;
    nameRU: string;
    nameEN: string;
    description: string;
    directions: string[];      // предположительно массив направлений
    fitting: string[];         // возможно "подходит для" / категории
    difficulty?: string;       // "лёгкий", "средний", "сложный"
    durationInDays?: number;
    dailyDurationInMinutes?: {
      from: number;
      to: number;
    };
    workouts: string[];        // массив id тренировок
  }
  
  export interface Workout {
    _id: string;
    name: string;
    video: string;             // URL YouTube embed
    exercises: Array<{
      name: string;
      quantity: number;        // рекомендованное количество повторений
      _id?: string;            // иногда есть, иногда нет
    }>;
  }
  
  export interface WorkoutProgress {
    workoutId: string;
    workoutCompleted: boolean;
    progressData: number[];    // массив выполненных повторений по упражнениям
  }
  
  export interface CourseProgress {
    courseId: string;
    courseCompleted: boolean;
    workoutsProgress: WorkoutProgress[];
  }
  
  // Для форм (Zod + react-hook-form)
  // Сообщения об ошибках соответствуют документации API
  // Согласно документации: POST /api/fitness/auth/register
  // Требования к паролю:
  // - Не менее 6 символов
  // - Не менее двух спецсимволов
  // - Не менее одной заглавной буквы
  const basePasswordSchema = z
    .string()
    .min(1, "Введите пароль")
    .superRefine((val, ctx) => {
      // Проверяем все требования к паролю
      // Zod покажет все ошибки, но react-hook-form покажет только первую для каждого поля
      if (val.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Пароль должен содержать не менее 6 симоволов", // Опечатка в документации API сохранена
        });
      }
      
      if (!/[A-Z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Пароль должен содержать как минимум одну заглавную букву",
        });
      }
      
      const specialChars = val.match(/[^A-Za-z0-9]/g) || [];
      if (specialChars.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Пароль должен содержать не менее 2 спецсимволов",
        });
      }
    });

  // Схема регистрации согласно документации API
  // Ошибки Email: "Введите корректный Email", "Пользователь с таким email уже существует"
  // Ошибки пароля: см. basePasswordSchema
  export const registerSchema = z.object({
    email: z
      .string()
      .min(1, "Введите Email")
      .email("Введите корректный Email"), // Сообщение из документации API
    password: basePasswordSchema,
    confirmPassword: z.string().min(1, "Повторите пароль"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });
  
  // Схема входа согласно документации API
  // Ошибки: "Пользователь с таким email не найден", "Неверный пароль"
  export const loginSchema = z.object({
    email: z
      .string()
      .min(1, "Введите Email")
      .email("Введите корректный Email"),
    password: z.string().min(1, "Введите пароль"),
  });
  
  export type RegisterFormData = z.infer<typeof registerSchema>;
  export type LoginFormData = z.infer<typeof loginSchema>;