import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 세션 쿠키 제거
    const response = NextResponse.json(
      { message: '로그아웃되었습니다.' },
      { status: 200 }
    );

    // 쿠키 삭제
    response.cookies.set('user-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // 즉시 만료
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
