import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import courseReducer from './features/courseSlise';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Экспортируем хуки для удобства
export { useAppDispatch, useAppSelector } from './hooks';
