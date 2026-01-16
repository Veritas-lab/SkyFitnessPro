// lib/types.ts
import z from "zod"; 
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
  export const registerSchema = z.object({
    email: z.string().email("Введите корректный Email"),
    password: z.string()
      .min(6, "Пароль должен содержать не менее 6 символов")
      .regex(/[A-Z]/, "Пароль должен содержать как минимум одну заглавную букву")
      .regex(/[^A-Za-z0-9]/g, { message: "Пароль должен содержать не менее 2 спецсимволов" }),
  });
  
  export const loginSchema = registerSchema; // можно использовать ту же схему
  
  export type RegisterFormData = z.infer<typeof registerSchema>;
  export type LoginFormData = z.infer<typeof loginSchema>;