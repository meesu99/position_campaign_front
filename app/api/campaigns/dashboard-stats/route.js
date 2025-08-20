import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('Dashboard stats API called');
    
    const cookies = request.headers.get('cookie');
    console.log('Cookies:', cookies);

    const response = await fetch('http://127.0.0.1:8080/campaigns/dashboard-stats', {
      method: 'GET',
      headers: {
        'Cookie': cookies || '',
      },
    });

    console.log('Backend response status:', response.status);
    const responseText = await response.text();
    console.log('Backend response text:', responseText);

    if (!response.ok) {
      console.error('Backend error response:', response.status, responseText);
      return NextResponse.json(
        { error: `백엔드 서버 오류: ${response.status}` }, 
        { status: response.status }
      );
    }

    let data;
    try {
      if (responseText.trim() === '') {
        console.error('Empty response from backend');
        return NextResponse.json(
          { error: '백엔드에서 빈 응답을 받았습니다.' }, 
          { status: 500 }
        );
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse backend response:', parseError);
      console.error('Response text was:', responseText);
      return NextResponse.json(
        { error: '서버 응답을 파싱할 수 없습니다.' }, 
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error for dashboard stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
