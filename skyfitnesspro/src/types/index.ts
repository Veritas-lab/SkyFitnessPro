// Все типы из API документации
export interface User {
    email: string;
    selectedCourses: string[];
  }
  
  export interface Course {
    _id: string;
    nameRU: string;
    nameEN: string;
    description: string;
    workouts: string[];
    poster: string;
  }
  
  export interface Workout {
    _id: string;
    name: string;
    video: string;
    exercises: { name: string; quantity: number }[];
  }
  
  export interface Progress {
    workoutId: string;
    workoutCompleted: boolean;
    progressData: number[]; // по упражнениям
  }
  
  export interface AuthData {
    email: string;
    password: string;
  }