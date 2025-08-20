import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    console.log(`Mark message as clicked API called for message ID: ${id}`);
    
    const response = await fetch(`http://127.0.0.1:8080/customer/messages/${id}/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Backend error response:', response.status, responseText);
      return NextResponse.json(
        { error: `백엔드 서버 오류: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Mark as clicked API error:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}
