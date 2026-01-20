import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, usersApi } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthState {
  user: string | null; // email пользователя
  token: string | null;
  error: string | null;
  loading: boolean;
  isAuth: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  error: null,
  loading: false,
  isAuth: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.login(email, password);
      const token = response.data.token;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }

      const userResponse = await usersApi.getMe();
      const userEmail = userResponse.data.email;

      return { token, user: userEmail };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Ошибка входа');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      await authApi.register(email, password);
      // После регистрации автоматически логинимся
      const response = await authApi.login(email, password);
      const token = response.data.token;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }

      const userResponse = await usersApi.getMe();
      const userEmail = userResponse.data.email;

      return { token, user: userEmail };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Ошибка регистрации');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<string | null>) => {
      state.user = action.payload;
      state.isAuth = !!action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    restoreSession: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          state.token = token;
          // Загрузим пользователя асинхронно
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuth = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuth = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuth = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuth = false;
      });
  },
});

export const { setUser, setToken, clearError, logout, restoreSession } =
  authSlice.actions;
export default authSlice.reducer;
