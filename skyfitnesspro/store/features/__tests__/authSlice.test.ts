import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  setUser,
  setToken,
  logout,
  clearError,
  login,
  register,
} from '../authSlice';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
  });

  describe('синхронные actions', () => {
    it('должен устанавливать пользователя', () => {
      store.dispatch(setUser('test@example.com'));
      const state = store.getState().auth;
      expect(state.user).toBe('test@example.com');
      expect(state.isAuth).toBe(true);
    });

    it('должен устанавливать токен', () => {
      store.dispatch(setToken('test-token'));
      const state = store.getState().auth;
      expect(state.token).toBe('test-token');
    });

    it('должен очищать ошибку', () => {
      // Сначала устанавливаем ошибку через rejected action
      store.dispatch({ type: 'auth/login/rejected', payload: 'Ошибка' });
      expect(store.getState().auth.error).toBe('Ошибка');

      // Затем очищаем
      store.dispatch(clearError());
      expect(store.getState().auth.error).toBeNull();
    });

    it('должен выполнять logout', () => {
      // Устанавливаем состояние
      store.dispatch(setUser('test@example.com'));
      store.dispatch(setToken('test-token'));
      localStorage.setItem('token', 'test-token');

      // Выполняем logout
      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuth).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('асинхронные thunks', () => {
    // Эти тесты требуют мокирования API
    // Для полного покрытия нужно добавить моки axios
    it('должен иметь правильную структуру для login.pending', () => {
      store.dispatch({ type: 'auth/login/pending' });
      const state = store.getState().auth;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('должен иметь правильную структуру для login.fulfilled', () => {
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: { token: 'test-token', user: 'test@example.com' },
      });
      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.token).toBe('test-token');
      expect(state.user).toBe('test@example.com');
      expect(state.isAuth).toBe(true);
      expect(state.error).toBeNull();
    });

    it('должен иметь правильную структуру для login.rejected', () => {
      store.dispatch({
        type: 'auth/login/rejected',
        payload: 'Ошибка входа',
      });
      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Ошибка входа');
      expect(state.isAuth).toBe(false);
    });
  });
});
