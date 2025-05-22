import { NextRequest, NextResponse } from 'next/server';
import * as dataService from '@/lib/dataService';
import type { LearningMaterial, Quiz, Announcement } from '@/lib/types';

// 验证 webhook 密钥的函数
const verifyWebhookSecret = (secret: string): boolean => {
  // 在生产环境中，应该使用环境变量存储和比较密钥
  const validSecret = process.env.WEBHOOK_SECRET || 'study-quest-webhook-secret';
  return secret === validSecret;
};

export async function POST(request: NextRequest) {
  try {
    // 获取请求头中的密钥
    const webhookSecret = request.headers.get('x-webhook-secret');
    
    // 验证密钥
    if (!webhookSecret || !verifyWebhookSecret(webhookSecret)) {
      return NextResponse.json(
        { success: false, error: '无效的 webhook 密钥' },
        { status: 401 }
      );
    }
    
    // 解析请求体
    const data = await request.json();
    
    // 验证必要字段
    if (!data.date) {
      return NextResponse.json(
        { success: false, error: '缺少必要的日期字段' },
        { status: 400 }
      );
    }
    
    // 验证至少有一种内容类型
    if (!data.material && !data.quiz && !data.announcement) {
      return NextResponse.json(
        { success: false, error: '请求必须包含至少一种内容类型（学习材料、测验或公告）' },
        { status: 400 }
      );
    }
    
    // 处理 webhook 数据
    const result = await dataService.updateDailyContentViaWebhook({
      date: data.date,
      material: data.material,
      quiz: data.quiz,
      announcement: data.announcement
    });
    
    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: '内容已成功更新',
        date: data.date,
        updatedTypes: {
          material: !!data.material,
          quiz: !!data.quiz,
          announcement: !!data.announcement
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: '更新内容失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('处理 webhook 请求时出错:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// 可选: 添加用于测试 webhook 是否工作的 GET 方法
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook 端点正常工作',
    usage: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': 'study-quest-webhook-secret'
      },
      body: {
        date: 'YYYY-MM-DD',
        material: {
          title: '标题',
          content: '内容'
        },
        quiz: {
          title: '测验标题',
          questions: []
        },
        announcement: {
          message: '公告内容'
        }
      }
    }
  });
} 