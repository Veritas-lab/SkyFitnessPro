import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/libs/fitness';

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json(
      { message: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    const token = await loginUser({ email, password });
    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
    return NextResponse.json(
      { message: errorMessage },
      { status: 400 }
    );
  }
}
