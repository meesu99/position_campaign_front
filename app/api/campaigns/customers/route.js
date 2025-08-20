import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const backendUrl = `http://127.0.0.1:8080/campaigns/customers${queryString ? `?${queryString}` : ''}`;

    console.log('Proxying to campaign customers:', backendUrl);

    const cookies = request.headers.get('cookie') || '';
    const authTokenMatch = cookies.match(/auth-token=([^;]+)/);
    const authToken = authTokenMatch ? authTokenMatch[1] : null;

    console.log('Auth token found for campaign customers:', authToken ? 'YES' : 'NO');

    const fetchOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    };

    if (authToken) {
      fetchOptions.headers['Cookie'] = `auth-token=${authToken}`;
    }

    const response = await fetch(backendUrl, fetchOptions);

    console.log('Campaign customers response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Campaign customers error:', errorText);
      return NextResponse.json({
        error: `Backend returned ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

    const responseText = await response.text();
    console.log('Campaign customers response size:', responseText.length, 'bytes');

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Campaign customers parsed successfully');
    } catch (e) {
      console.error('Campaign customers JSON parse error:', e);
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
    console.error('Campaign customers proxy error:', error);
    return NextResponse.json({
      error: 'Proxy error',
      message: error.message
    }, { status: 500 });
  }
}
