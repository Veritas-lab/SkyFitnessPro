// Определяем базовый URL API
// На клиенте используем относительный путь через Next.js прокси
// На сервере используем полный URL из переменной окружения
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Клиентская среда - используем относительный путь через прокси
    return '/api/fitness';
  }
  // Серверная среда - используем полный URL из переменной окружения
  return process.env.NEXT_PUBLIC_API_URL || 'https://wedev-api.sky.pro/api/fitness';
};

const API_BASE_URL = getApiBaseUrl();

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

/**
 * Авторизация пользователя
 * @param credentials - email и password
 * @returns Promise с токеном
 */
export async function loginUser(credentials: LoginCredentials): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {},
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка входа' }));
    throw new Error(error.message || 'Ошибка входа');
  }

  const data = await response.json();
  return data.token;
}

/**
 * Регистрация пользователя
 * @param credentials - email и password
 * @returns Promise с сообщением об успехе
 */
export async function registerUser(credentials: RegisterCredentials): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {},
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка регистрации' }));
    throw new Error(error.message || 'Ошибка регистрации');
  }

  const data = await response.json();
  return data.message || 'Регистрация успешна';
}

/**
 * Получить данные пользователя
 * @param token - токен авторизации
 * @returns Promise с данными пользователя
 */
export async function getUser(token: string) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка получения данных пользователя' }));
    throw new Error(error.message || 'Ошибка получения данных пользователя');
  }

  return await response.json();
}

/**
 * Получить данные пользователя по токену (алиас для getUser)
 * @param token - токен авторизации
 * @returns Promise с данными пользователя
 */
export async function getUserByToken(token: string) {
  return getUser(token);
}

/**
 * Получить все курсы
 * @returns Promise с массивом курсов
 */
export async function getCourses() {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'GET',
    headers: {},
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка получения курсов' }));
    throw new Error(error.message || 'Ошибка получения курсов');
  }

  return await response.json();
}

/**
 * Получить все курсы (алиас для getCourses)
 * @returns Promise с массивом курсов
 */
export async function getAllCourses() {
  return getCourses();
}

/**
 * Получить курс по ID
 * @param courseId - ID курса
 * @returns Promise с данными курса
 */
export async function getCourseById(courseId: string) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    method: 'GET',
    headers: {},
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка получения курса' }));
    throw new Error(error.message || 'Ошибка получения курса');
  }

  return await response.json();
}

/**
 * Добавить курс пользователю (базовая функция с токеном)
 * @param token - токен авторизации
 * @param courseId - ID курса
 * @returns Promise
 */
async function addCourseToUserWithToken(token: string, courseId: string) {
  const response = await fetch(`${API_BASE_URL}/users/me/courses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ courseId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка добавления курса' }));
    throw new Error(error.message || 'Ошибка добавления курса');
  }

  return await response.json();
}

/**
 * Добавить курс пользователю
 * @param userId - ID пользователя (не используется напрямую, но нужен для совместимости)
 * @param courseId - ID курса
 * @param token - токен авторизации (опционально, но обязателен для работы)
 * @returns Promise
 */
export async function addCourseToUser(
  userId: string,
  courseId: string,
  token?: string
) {
  if (!token) {
    throw new Error('Токен авторизации обязателен для добавления курса');
  }
  return addCourseToUserWithToken(token, courseId);
}

/**
 * Удалить курс у пользователя
 * @param token - токен авторизации
 * @param courseId - ID курса
 * @returns Promise
 */
export async function removeCourseFromUser(token: string, courseId: string) {
  const response = await fetch(`${API_BASE_URL}/users/me/courses/${courseId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка удаления курса' }));
    throw new Error(error.message || 'Ошибка удаления курса');
  }

  return await response.json();
}

/**
 * Удалить курс у пользователя (алиас для removeCourseFromUser)
 * @param userId - ID пользователя (не используется напрямую, но нужен для совместимости)
 * @param courseId - ID курса
 * @param token - токен авторизации (опционально)
 * @returns Promise
 */
export async function deleteCourseFromUser(
  userId: string,
  courseId: string,
  token?: string
) {
  if (!token) {
    throw new Error('Токен авторизации обязателен для удаления курса');
  }
  return removeCourseFromUser(token, courseId);
}

/**
 * Проверка и декодирование JWT токена
 * @param token - JWT токен
 * @returns Декодированные данные токена или null
 */
export function verifyToken(token: string): { id: string; email?: string } | null {
  try {
    if (!token) return null;

    // Базовый парсинг JWT (без проверки подписи)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Декодирование base64 (работает и в браузере, и в Node.js)
    interface JwtPayload {
      id?: string;
      userId?: string;
      sub?: string;
      email?: string;
      exp?: number;
    }
    
    let payload: JwtPayload;
    if (typeof window === 'undefined') {
      // Серверная среда (Node.js)
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8')) as JwtPayload;
    } else {
      // Браузерная среда
      payload = JSON.parse(atob(parts[1])) as JwtPayload;
    }
    
    // Проверяем, что токен не истек (если есть exp)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: payload.id || payload.userId || payload.sub || '',
      email: payload.email,
    };
  } catch {
    return null;
  }
}

/**
 * Сбросить прогресс курса для пользователя
 * @param userId - ID пользователя (не используется напрямую, но нужен для совместимости)
 * @param courseId - ID курса
 * @param token - токен авторизации (опционально, если не передан, используется userId для получения токена)
 * @returns Promise
 */
export async function restartCourseForUser(
  userId: string,
  courseId: string,
  token?: string
) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/reset`, {
    method: 'PATCH',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка сброса прогресса курса' }));
    throw new Error(error.message || 'Ошибка сброса прогресса курса');
  }

  return await response.json();
}

/**
 * Получить прогресс тренировки
 * @param userId - ID пользователя (не используется напрямую, но нужен для совместимости)
 * @param courseId - ID курса
 * @param workoutId - ID тренировки
 * @param token - токен авторизации (обязателен)
 * @returns Promise с прогрессом тренировки
 */
export async function getWorkoutProgress(
  userId: string,
  courseId: string,
  workoutId: string,
  token?: string
) {
  if (!token) {
    throw new Error('Токен авторизации обязателен для получения прогресса');
  }

  const response = await fetch(
    `${API_BASE_URL}/users/me/progress?courseId=${courseId}&workoutId=${workoutId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка получения прогресса тренировки' }));
    throw new Error(error.message || 'Ошибка получения прогресса тренировки');
  }

  return await response.json();
}

/**
 * Получить весь прогресс по курсу (все тренировки)
 * @param userId - ID пользователя (не используется напрямую, но нужен для совместимости)
 * @param courseId - ID курса
 * @param token - токен авторизации (обязателен)
 * @returns Promise с прогрессом по всем тренировкам курса
 */
export async function getAllWorkoutsProgress(
  userId: string,
  courseId: string,
  token?: string
) {
  if (!token) {
    throw new Error('Токен авторизации обязателен для получения прогресса');
  }

  const response = await fetch(
    `${API_BASE_URL}/users/me/progress?courseId=${courseId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка получения прогресса курса' }));
    throw new Error(error.message || 'Ошибка получения прогресса курса');
  }

  return await response.json();
}

/**
 * Получить тренировку по ID
 * @param workoutId - ID тренировки
 * @param token - токен авторизации (обязателен)
 * @returns Promise с данными тренировки
 */
export async function getWorkoutById(workoutId: string, token?: string) {
  if (!token) {
    throw new Error('Токен авторизации обязателен для получения тренировки');
  }

  const response = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка получения тренировки' }));
    throw new Error(error.message || 'Ошибка получения тренировки');
  }

  return await response.json();
}
