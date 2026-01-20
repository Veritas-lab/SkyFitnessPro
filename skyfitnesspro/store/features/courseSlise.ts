import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course } from '@/lib/types';

interface CourseState {
  allCourses: Course[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  allCourses: [],
  isLoading: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setAllCourses: (state, action: PayloadAction<Course[]>) => {
      state.allCourses = action.payload;
    },
    setFetchIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setFetchError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addCourse: (state, action: PayloadAction<Course>) => {
      const exists = state.allCourses.some((c) => c._id === action.payload._id);
      if (!exists) {
        state.allCourses.push(action.payload);
      }
    },
    removeCourse: (state, action: PayloadAction<string>) => {
      state.allCourses = state.allCourses.filter((c) => c._id !== action.payload);
    },
  },
});

export const {
  setAllCourses,
  setFetchIsLoading,
  setFetchError,
  addCourse,
  removeCourse,
} = courseSlice.actions;
export default courseSlice.reducer;
