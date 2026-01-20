import { NextRequest, NextResponse } from 'next/server';
import { addCourseToUser, verifyToken } from '@/libs/fitness';

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json(
      { message: 'Method not allowed' },
      { status: 405 }
    );
  }

  const auth = request.headers.get('authorization');
  const token = auth?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { message: 'Отсутствует Authorization токен' },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { message: 'Невалидный токен' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { message: 'ID курса должен быть указан' },
        { status: 400 }
      );
    }

    await addCourseToUser(decoded.id, courseId, token);
    return NextResponse.json(
      { message: 'Курс успешно добавлен!' },
      { status: 200 }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка добавления курса';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
