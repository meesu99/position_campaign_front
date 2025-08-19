import { NextResponse } from 'next/server';

// 임시 사용자 데이터 (실제로는 데이터베이스를 사용해야 함)
const users = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    name: '관리자',
    role: 'ADMIN'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'user123',
    name: '사용자',
    role: 'USER'
  }
];

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 찾기
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 제외하고 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user;

    // 실제로는 JWT 토큰을 생성하고 쿠키에 설정해야 함
    const response = NextResponse.json({
      user: userWithoutPassword,
      message: '로그인 성공'
    });

    // 간단한 세션 쿠키 설정 (실제로는 JWT 사용 권장)
    response.cookies.set('user-session', JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7일
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
