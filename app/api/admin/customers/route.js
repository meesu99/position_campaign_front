import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const backendUrl = `http://127.0.0.1:8080/admin/customers${queryString ? `?${queryString}` : ''}`;

    console.log('Proxying to:', backendUrl);

    const cookies = request.headers.get('cookie') || '';
    const authTokenMatch = cookies.match(/auth-token=([^;]+)/);
    const authToken = authTokenMatch ? authTokenMatch[1] : null;

    console.log('Auth token found:', authToken ? 'YES' : 'NO');

    const fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    };

    if (authToken) {
      fetchOptions.headers['Cookie'] = `auth-token=${authToken}`;
    }

    console.log('Fetch options:', JSON.stringify(fetchOptions, null, 2));

    const response = await fetch(backendUrl, fetchOptions);

    console.log('Backend response status:', response.status);
    console.log('Backend response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json({
        error: `Backend returned ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

    const responseText = await response.text();
    console.log('Backend response size:', responseText.length, 'bytes');

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Backend response parsed successfully');
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json({
        error: 'Invalid JSON response from backend'
      }, { status: 500 });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      error: 'Proxy error',
      message: error.message,
      type: error.constructor.name
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const cookies = request.headers.get('cookie');

    const response = await fetch('http://127.0.0.1:8080/admin/customers', {
      method: 'POST',
      headers: {
        'Cookie': cookies || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}