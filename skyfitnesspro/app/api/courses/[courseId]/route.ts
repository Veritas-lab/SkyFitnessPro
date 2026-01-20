import { NextRequest, NextResponse } from 'next/server';
import { getCourseById } from '@/libs/fitness';
import { verifyToken, deleteCourseFromUser } from '@/libs/fitness';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  if (!courseId) {
    return NextResponse.json(
      { message: 'Course ID is required' },
      { status: 400 }
    );
  }

  try {
    const course = await getCourseById(courseId);
    return NextResponse.json(course, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка получения курса';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    await deleteCourseFromUser(decoded.id, courseId, token);
    return NextResponse.json(
      { message: 'Курс успешно удален!' },
      { status: 200 }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления курса';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
