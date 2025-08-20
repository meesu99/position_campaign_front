import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('Campaign creation API called');
    const body = await request.json();
    console.log('Campaign data received:', JSON.stringify(body, null, 2));
    
    const cookies = request.headers.get('cookie');
    console.log('Cookies:', cookies);

    const response = await fetch('http://127.0.0.1:8080/campaigns', {
      method: 'POST',
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);
    const responseText = await response.text();
    console.log('Backend response text:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse backend response:', parseError);
      return NextResponse.json(
        { error: '서버 응답을 파싱할 수 없습니다.' }, 
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error for campaign creation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
