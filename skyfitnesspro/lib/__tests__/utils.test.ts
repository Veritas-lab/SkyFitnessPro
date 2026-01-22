import { getErrorMessage } from '../utils';
import { AxiosError } from 'axios';

// Вспомогательная функция для создания AxiosError
function createAxiosError(config: {
  message?: string;
  response?: {
    data?: { message?: string };
    status?: number;
  };
}): AxiosError {
  const error = new Error(config.message || 'Request failed') as AxiosError;
  error.isAxiosError = true;
  if (config.response) {
    error.response = {
      data: config.response.data || {},
      status: config.response.status,
      statusText: '',
      headers: {},
      config: {} as any,
    };
  }
  // Устанавливаем прототип для правильной работы instanceof
  Object.setPrototypeOf(error, AxiosError.prototype);
  return error;
}

describe('getErrorMessage', () => {
  it('должен возвращать сообщение от сервера для AxiosError', () => {
    const error = createAxiosError({
      response: {
        data: {
          message: 'Пользователь не найден',
        },
        status: 404,
      },
    });

    expect(getErrorMessage(error)).toBe('Пользователь не найден');
  });

  it('должен возвращать стандартное сообщение для 401', () => {
    const error = createAxiosError({
      response: {
        status: 401,
      },
    });

    expect(getErrorMessage(error)).toBe('Сессия истекла. Пожалуйста, войдите заново.');
  });

  it('должен возвращать стандартное сообщение для 403', () => {
    const error = createAxiosError({
      response: {
        status: 403,
      },
    });

    expect(getErrorMessage(error)).toBe('Доступ запрещён.');
  });

  it('должен возвращать стандартное сообщение для 404', () => {
    const error = createAxiosError({
      response: {
        status: 404,
      },
    });

    expect(getErrorMessage(error)).toBe('Ресурс не найден.');
  });

  it('должен возвращать стандартное сообщение для 500', () => {
    const error = createAxiosError({
      response: {
        status: 500,
      },
    });

    expect(getErrorMessage(error)).toBe('Ошибка сервера. Попробуйте позже.');
  });

  it('должен возвращать message из AxiosError, если нет response', () => {
    const error = createAxiosError({
      message: 'Network Error',
    });

    expect(getErrorMessage(error)).toBe('Network Error');
  });

  it('должен возвращать message из обычной Error', () => {
    const error = new Error('Произошла ошибка');

    expect(getErrorMessage(error)).toBe('Произошла ошибка');
  });

  it('должен возвращать строку для неизвестных типов ошибок', () => {
    const error = 'Просто строка';

    expect(getErrorMessage(error)).toBe('Просто строка');
  });

  it('должен возвращать строку для null', () => {
    expect(getErrorMessage(null)).toBe('null');
  });

  it('должен возвращать строку для undefined', () => {
    expect(getErrorMessage(undefined)).toBe('undefined');
  });
});
