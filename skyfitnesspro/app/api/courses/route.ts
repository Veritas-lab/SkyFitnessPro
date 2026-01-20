import { NextRequest, NextResponse } from 'next/server';
import { getAllCourses } from '@/libs/fitness';

export async function GET(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json(
      { message: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const courses = await getAllCourses();
    return NextResponse.json(courses, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка получения курсов';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
