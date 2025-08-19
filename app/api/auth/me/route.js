import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 쿠키에서 세션 정보 가져오기
    const sessionCookie = request.cookies.get('user-session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    try {
      const user = JSON.parse(sessionCookie.value);
      return NextResponse.json(user);
    } catch (parseError) {
      return NextResponse.json(
        { error: '유효하지 않은 세션입니다.' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: '인증 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
