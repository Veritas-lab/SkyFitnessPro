import { NextRequest, NextResponse } from 'next/server';

// Базовый URL внешнего API
// Установите переменную окружения NEXT_PUBLIC_API_URL в .env.local
// Например: NEXT_PUBLIC_API_URL=https://api.example.com/api/fitness
// Или используйте локальный API, если он запущен на другом порту
// Если переменная не установлена, API будет возвращать ошибку подключения
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleRequest(request, path, 'POST');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleRequest(request, path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleRequest(request, path, 'DELETE');
}

// Мок-данные для разработки
const MOCK_COURSES = [
  {
    _id: '1',
    nameRU: 'Йога',
    nameEN: 'Yoga',
    description: 'Классическая йога для начинающих и продвинутых',
    directions: [],
    fitting: [],
    difficulty: 'сложный',
    durationInDays: 25,
    dailyDurationInMinutes: { from: 20, to: 50 },
    workouts: ['1', '2'],
  },
  {
    _id: '2',
    nameRU: 'Стретчинг',
    nameEN: 'Stretching',
    description: 'Растяжка для улучшения гибкости',
    directions: [],
    fitting: [],
    difficulty: 'лёгкий',
    durationInDays: 25,
    dailyDurationInMinutes: { from: 20, to: 50 },
    workouts: ['3', '4'],
  },
  {
    _id: '3',
    nameRU: 'Фитнес',
    nameEN: 'Fitness',
    description: 'Силовые тренировки для всего тела',
    directions: [],
    fitting: [],
    difficulty: 'средний',
    durationInDays: 25,
    dailyDurationInMinutes: { from: 20, to: 50 },
    workouts: ['5', '6'],
  },
  {
    _id: '4',
    nameRU: 'Степ-аэробика',
    nameEN: 'Step Aerobics',
    description: 'Кардио тренировки на степ-платформе',
    directions: [],
    fitting: [],
    difficulty: 'средний',
    durationInDays: 25,
    dailyDurationInMinutes: { from: 20, to: 50 },
    workouts: ['7', '8'],
  },
  {
    _id: '5',
    nameRU: 'Бодифлекс',
    nameEN: 'Bodyflex',
    description: 'Дыхательная гимнастика и растяжка',
    directions: [],
    fitting: [],
    difficulty: 'лёгкий',
    durationInDays: 25,
    dailyDurationInMinutes: { from: 20, to: 50 },
    workouts: ['9', '10'],
  },
];

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const path = pathSegments.join('/');
  
  // Если API URL не настроен, API находится на том же домене по пути /api/fitness
  // В этом случае используем мок-данные для /courses или возвращаем ошибку
  if (!API_BASE_URL) {
    // Мок для GET /courses
    if (method === 'GET' && path === 'courses') {
      return NextResponse.json(MOCK_COURSES, { status: 200 });
    }
    
    // Для других endpoints возвращаем ошибку, так как API должен быть настроен
    return NextResponse.json(
      { 
        message: 'API находится на том же домене. Убедитесь, что API routes настроены правильно или установите NEXT_PUBLIC_API_URL для внешнего API.' 
      },
      { status: 500 }
    );
  }

  try {
    // Получаем query параметры
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // Формируем URL для внешнего API
    const url = `${API_BASE_URL}/${path}${queryString ? `?${queryString}` : ''}`;

    // Получаем тело запроса (если есть)
    let body = null;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.json();
      } catch {
        // Если нет тела, игнорируем
      }
    }

    // Получаем заголовки авторизации
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Выполняем запрос к внешнему API
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Пытаемся получить JSON ответ
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Если ответ не JSON, читаем как текст
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        // Если не удалось распарсить, возвращаем текст как сообщение об ошибке
        data = { message: text || 'Ошибка сервера' };
      }
    }

    // Возвращаем ответ с тем же статусом, что и внешний API
    // Согласно документации, ошибки возвращаются со статусом 404
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Proxy Error:', error);
    
    // Обрабатываем ошибки сети
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: 'Не удалось подключиться к API серверу. Проверьте URL и убедитесь, что сервер запущен.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: 'Ошибка при обращении к API' },
      { status: 500 }
    );
  }
}
