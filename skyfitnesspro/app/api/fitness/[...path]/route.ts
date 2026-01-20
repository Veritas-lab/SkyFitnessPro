import { NextRequest, NextResponse } from 'next/server';

// Базовый URL внешнего API
// Если NEXT_PUBLIC_API_URL не установлен, используем дефолтный
const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wedev-api.sky.pro/api/fitness';

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

  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${EXTERNAL_API_URL}/${path}${queryString ? `?${queryString}` : ''}`;

    let body = null;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.json();
      } catch {
        // If no body, ignore
      }
    }

    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {};
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || 'Ошибка сервера' };
      }
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
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
