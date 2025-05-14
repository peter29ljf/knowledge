import { NextResponse } from 'next/server';
import initializeData from '@/lib/initData';

// 用于确保初始化只运行一次的标志
let initialized = false;

export async function GET() {
  if (!initialized) {
    try {
      console.log('首次请求，开始初始化数据...');
      await initializeData();
      initialized = true;
      return NextResponse.json({ success: true, message: '数据初始化成功' });
    } catch (error) {
      console.error('初始化数据时出错:', error);
      return NextResponse.json(
        { success: false, error: '初始化失败', details: String(error) },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ success: true, message: '数据已经初始化' });
  }
} 