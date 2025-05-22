import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 转发到新的数据初始化API
    const response = await fetch(new URL('/api/data/init', 'http://localhost'), {
      method: 'POST'
    });
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('调用数据初始化API时出错:', error);
    return NextResponse.json(
      { success: false, error: '初始化失败', details: String(error) },
      { status: 500 }
    );
  }
} 