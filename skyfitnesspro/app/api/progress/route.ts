import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getWorkoutProgress, getAllWorkoutsProgress } from '@/libs/fitness';

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

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { message: 'Невалидный токен' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const workoutId = searchParams.get('workoutId');

  if (!courseId) {
    return NextResponse.json(
      { message: 'ID курса должен быть указан' },
      { status: 400 }
    );
  }

  try {
    const progress = workoutId
      ? await getWorkoutProgress(decoded.id, courseId, workoutId, token)
      : await getAllWorkoutsProgress(decoded.id, courseId, token);
    
    return NextResponse.json(progress, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка получения прогресса';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
