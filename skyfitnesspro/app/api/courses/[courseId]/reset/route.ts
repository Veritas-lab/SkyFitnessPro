import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, restartCourseForUser } from '@/libs/fitness';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

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

  if (!courseId) {
    return NextResponse.json(
      { message: 'ID курса должен быть указан' },
      { status: 400 }
    );
  }

  try {
    await restartCourseForUser(decoded.id, courseId, token);
    return NextResponse.json(
      { message: 'Прогресс курса удалён!' },
      { status: 200 }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка сброса прогресса';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
