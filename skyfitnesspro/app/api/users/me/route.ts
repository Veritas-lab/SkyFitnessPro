import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/libs/fitness';

export async function GET(request: NextRequest) {
  if (request.method !== 'GET') {
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

  try {
    const user = await getUserByToken(token);
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка получения данных пользователя';
    return NextResponse.json(
      { message: errorMessage },
      { status: 400 }
    );
  }
}
