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

    // НЕ добавляем Content-Type, так как API не поддерживает этот заголовок

    // Для POST запросов логируем детали для отладки
    if (method === 'POST' && path === 'users/me/courses') {
      console.log('📤 Отправка запроса на добавление курса:', {
        url,
        body,
        hasAuth: !!authHeader,
        method,
        headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined }
      });
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (fetchError) {
      console.error('❌ Ошибка при выполнении fetch запроса:', fetchError);
      throw fetchError;
    }

    let data;
    const contentType = response.headers.get('content-type');
    let responseText = '';
    
    try {
      responseText = await response.text();
      if (contentType && contentType.includes('application/json')) {
        data = JSON.parse(responseText);
      } else {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText || 'Ошибка сервера' };
        }
      }
    } catch (parseError) {
      // Если не удалось распарсить ответ, возвращаем базовое сообщение
      data = { 
        message: response.status === 400 
          ? 'Неверный формат запроса. Проверьте отправляемые данные.' 
          : responseText || 'Ошибка при обработке ответа сервера' 
      };
    }

    // Если статус 400, логируем детали для отладки
    if (response.status === 400) {
      if (method === 'POST' && path === 'users/me/courses') {
        console.error('❌ Ошибка 400 при добавлении курса:', {
          externalUrl: url,
          requestBody: body,
          requestHeaders: { ...headers, Authorization: 'Bearer ***' },
          responseStatus: response.status,
          responseStatusText: response.statusText,
          responseText: responseText.substring(0, 1000),
          responseData: data,
          contentType: contentType
        });
      }
      
      return NextResponse.json(
        { 
          message: data?.message || responseText || `Неверный формат запроса к ${path}. Проверьте отправляемые данные.`,
          details: process.env.NODE_ENV === 'development' ? {
            url,
            requestBody: body,
            responseText: responseText.substring(0, 500),
            responseData: data
          } : undefined
        },
        { status: 400 }
      );
    }

    // Если статус 500, возвращаем более информативное сообщение
    if (response.status === 500) {
      // Проверяем, не является ли это запросом к несуществующему эндпоинту
      if (path === 'users/me/courses' && method === 'GET') {
        return NextResponse.json(
          { 
            message: 'Эндпоинт GET /users/me/courses не существует. Используйте GET /users/me для получения данных пользователя с выбранными курсами.' 
          },
          { status: 404 }
        );
      }
      
      // Логируем детали ошибки для POST запросов
      if (method === 'POST' && path === 'users/me/courses') {
        const authToken = authHeader ? authHeader.replace('Bearer ', '').substring(0, 10) + '...' : 'нет';
        const errorDetails = {
          externalUrl: url,
          requestBody: body,
          requestHeaders: { ...headers, Authorization: 'Bearer ***' },
          hasAuthHeader: !!authHeader,
          authTokenPreview: authToken,
          responseStatus: response.status,
          responseStatusText: response.statusText,
          responseText: responseText.substring(0, 1000), // Первые 1000 символов
          responseData: data,
          contentType: contentType,
          allResponseHeaders: Object.fromEntries(response.headers.entries())
        };
        console.error('❌ Ошибка 500 при добавлении курса:', JSON.stringify(errorDetails, null, 2));
        
        // Проверяем, не является ли это сообщением о том, что курс уже добавлен
        const message = data?.message || responseText || '';
        if (message.includes('уже был добавлен') || message.includes('уже добавлен') || message.includes('already added')) {
          // Возвращаем 200 с информативным сообщением
          return NextResponse.json(
            { 
              message: message,
              alreadyAdded: true
            },
            { status: 200 }
          );
        }
        
        // Возвращаем более детальную информацию об ошибке
        return NextResponse.json(
          { 
            message: data?.message || responseText || `Ошибка сервера при запросе к ${path}. Проверьте правильность эндпоинта и параметров запроса.`,
            details: process.env.NODE_ENV === 'development' ? {
              url,
              requestBody: body,
              responseText: responseText.substring(0, 500),
              responseData: data,
              responseStatus: response.status,
              responseStatusText: response.statusText
            } : undefined
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          message: data?.message || responseText || `Ошибка сервера при запросе к ${path}. Проверьте правильность эндпоинта и параметров запроса.` 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Ошибка в handleRequest:', {
      path,
      method,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: 'Не удалось подключиться к API серверу. Проверьте URL и убедитесь, что сервер запущен.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Ошибка при обращении к API' },
      { status: 500 }
    );
  }
}
