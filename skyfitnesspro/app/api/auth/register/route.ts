import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/libs/fitness';

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

    await registerUser({ email, password });
    return NextResponse.json(
      { message: 'Регистрация прошла успешно!' },
      { status: 201 }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
    return NextResponse.json(
      { message: errorMessage },
      { status: 400 }
    );
  }
}
