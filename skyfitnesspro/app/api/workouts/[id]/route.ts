import { NextRequest, NextResponse } from 'next/server';
import { getWorkoutById, verifyToken } from '@/libs/fitness';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { message: 'Невалидный токен' },
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { message: 'ID тренировки должен быть указан' },
      { status: 400 }
    );
  }

  try {
    const workout = await getWorkoutById(id, token);
    return NextResponse.json(workout, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка получения тренировки';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
