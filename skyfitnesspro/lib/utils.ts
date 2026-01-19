// lib/utils.ts
import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
  // Самый частый случай — ошибка от axios
  if (error instanceof AxiosError) {
    // Пытаемся достать message из типичного ответа сервера
    const serverMessage = error.response?.data?.message;
    const status = error.response?.status;

    // Согласно документации API, ошибки auth endpoints возвращаются с 404
    // Приоритет отдаём сообщению от сервера
    if (typeof serverMessage === 'string') {
      return serverMessage;
    }

    // Стандартные HTTP ошибки
    if (status === 401) return 'Сессия истекла. Пожалуйста, войдите заново.';
    if (status === 403) return 'Доступ запрещён.';
    if (status === 404) return 'Ресурс не найден.';
    if (status === 429) return 'Слишком много запросов. Попробуйте позже.';
    if (status === 500) return 'Ошибка сервера. Попробуйте позже.';
    if (status === 502) return 'Ошибка сети. Попробуйте позже.';
    if (status === 503) return 'Сервис временно недоступен. Попробуйте позже.';
    if (status === 504) return 'Время ожидания запроса истекло. Попробуйте позже.';

    // Если нет — берём стандартное сообщение axios
    return error.message || 'Ошибка запроса к серверу';
  }

  // Обычная JS-ошибка
  if (error instanceof Error) {
    return error.message;
  }

  // На всякий случай — если что-то совсем странное
  return String(error) || 'Неизвестная ошибка';
}