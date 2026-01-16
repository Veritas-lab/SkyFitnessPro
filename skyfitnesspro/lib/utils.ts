// lib/utils.ts
import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
  // Самый частый случай — ошибка от axios
  if (error instanceof AxiosError) {
    // Пытаемся достать message из типичного ответа сервера
    const serverMessage = error.response?.data?.message;
    const status = error.response?.status;

    if (status === 401) return 'Сессия истекла. Пожалуйста, войдите заново.';
    if (status === 403) return 'Доступ запрещён.';
    if (status === 429) return 'Слишком много запросов. Попробуйте позже.';
    if (status === 500) return 'Ошибка сервера. Попробуйте позже.';
    if (status === 502) return 'Ошибка сети. Попробуйте позже.';
    if (status === 503) return 'Сервис временно недоступен. Попробуйте позже.';
    if (status === 504) return 'Время ожидания запроса истекло. Попробуйте позже.';
    if (status === 507) return 'Недостаточно места на диске. Попробуйте позже.';
    if (status === 508) return 'Запрос превысил лимит времени. Попробуйте позже.';
    if (status === 509) return 'Превышен лимит трафика. Попробуйте позже.';
    if (status === 510) return 'Недостаточно прав. Попробуйте позже.';
    if (status === 511) return 'Недостаточно средств. Попробуйте позже.';
    if (status === 512) return 'Недостаточно ресурсов. Попробуйте позже.';
    if (status === 513) return 'Недостаточно памяти. Попробуйте позже.';
    if (status === 514) return 'Недостаточно процессов. Попробуйте позже.';
    if (status === 515) return 'Недостаточно времени. Попробуйте позже.';
    if (status === 516) return 'Недостаточно памяти. Попробуйте позже.';
    if (status === 517) return 'Недостаточно процессов. Попробуйте позже.';
    if (status === 518) return 'Недостаточно времени. Попробуйте позже.';
    if (status === 519) return 'Недостаточно памяти. Попробуйте позже.';
    if (status === 520) return 'Недостаточно процессов. Попробуйте позже.';
    if (status === 521) return 'Недостаточно времени. Попробуйте позже.';
    if (status === 522) return 'Недостаточно памяти. Попробуйте позже.';

    if (typeof serverMessage === 'string') {
      return serverMessage;
    }

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