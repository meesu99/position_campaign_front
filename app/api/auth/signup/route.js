import { NextResponse } from 'next/server';

// 임시 사용자 저장소 (실제로는 데이터베이스를 사용해야 함)
let users = [
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
    const userData = await request.json();
    const { email, password, name, phone } = userData;

    // 필수 필드 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 이름은 필수 입력사항입니다.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // 새 사용자 생성
    const newUser = {
      id: users.length + 1,
      email,
      password, // 실제로는 해시화해야 함
      name,
      phone: phone || '',
      role: 'USER',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
