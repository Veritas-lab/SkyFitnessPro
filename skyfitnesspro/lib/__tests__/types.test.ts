import { registerSchema, loginSchema } from '../types';

describe('Zod схемы валидации', () => {
  describe('loginSchema', () => {
    it('должен валидировать корректные данные', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!!',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять пустой email', () => {
      const invalidData = {
        email: '',
        password: 'Password123!!',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Введите Email');
      }
    });

    it('должен отклонять некорректный email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123!!',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Введите корректный Email');
      }
    });

    it('должен отклонять пустой пароль', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('должен валидировать корректные данные', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!!',
        confirmPassword: 'Password123!!',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять пароль менее 6 символов', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === 'password' && issue.message.includes('6 симоволов')
        );
        expect(passwordError?.message).toContain('6 симоволов');
      }
    });

    it('должен отклонять пароль без заглавной буквы', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123!!',
        confirmPassword: 'password123!!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === 'password'
        );
        expect(passwordError?.message).toContain('заглавную букву');
      }
    });

    it('должен отклонять пароль с менее чем 2 спецсимволами', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === 'password'
        );
        expect(passwordError?.message).toContain('2 спецсимволов');
      }
    });

    it('должен отклонять несовпадающие пароли', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123!!',
        confirmPassword: 'Password123##',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmPasswordError = result.error.issues.find(
          (issue) => issue.path[0] === 'confirmPassword'
        );
        expect(confirmPasswordError?.message).toBe('Пароли не совпадают');
      }
    });
  });
});
