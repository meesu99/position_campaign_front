import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const cookies = request.headers.get('cookie');

    console.log('Campaign preview request:', JSON.stringify(body, null, 2));

    const response = await fetch('http://127.0.0.1:8080/campaigns/preview', {
      method: 'POST',
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json({
        error: `Backend returned ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Backend response data:', data);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
      }
    });

  } catch (error) {
    console.error('Campaign preview proxy error:', error);
    return NextResponse.json({
      error: 'Proxy error',
      message: error.message
    }, { status: 500 });
  }
}
