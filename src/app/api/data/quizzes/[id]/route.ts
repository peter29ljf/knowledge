import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Quiz } from '@/lib/types';

// 路径常量
const PUBLIC_DIR = path.join(process.cwd(), 'data/public');
const QUIZZES_FILE = path.join(PUBLIC_DIR, 'quizzes.json');

// 帮助函数：安全地读取JSON文件
const readJsonFile = <T>(filePath: string, defaultValue: T): T => {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as T;
  } catch (error) {
    console.error(`读取文件 ${filePath} 时出错:`, error);
    return defaultValue;
  }
};

// 帮助函数：安全地写入JSON文件
const writeJsonFile = <T>(filePath: string, data: T): boolean => {
  try {
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 写入临时文件，然后重命名，确保原子性
    const tempFile = `${filePath}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, filePath);
    return true;
  } catch (error) {
    console.error(`写入文件 ${filePath} 时出错:`, error);
    return false;
  }
};

// 获取特定ID的测验
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizzes = readJsonFile<Quiz[]>(QUIZZES_FILE, []);
    const quiz = quizzes.find(q => q.id === params.id);
    
    if (!quiz) {
      return NextResponse.json(
        { error: '测验不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(quiz);
  } catch (error) {
    console.error(`获取测验 ${params.id} 时出错:`, error);
    return NextResponse.json(
      { error: '获取测验失败', details: String(error) },
      { status: 500 }
    );
  }
}

// 更新特定ID的测验
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizzes = readJsonFile<Quiz[]>(QUIZZES_FILE, []);
    const updatedQuiz = await request.json();
    
    // 确保ID匹配
    if (updatedQuiz.id !== params.id) {
      return NextResponse.json(
        { error: 'ID不匹配' },
        { status: 400 }
      );
    }
    
    const quizIndex = quizzes.findIndex(q => q.id === params.id);
    
    if (quizIndex === -1) {
      return NextResponse.json(
        { error: '测验不存在' },
        { status: 404 }
      );
    }
    
    // 更新测验
    quizzes[quizIndex] = updatedQuiz;
    
    // 保存更新后的数据
    if (writeJsonFile(QUIZZES_FILE, quizzes)) {
      return NextResponse.json(updatedQuiz);
    } else {
      throw new Error('保存测验失败');
    }
  } catch (error) {
    console.error(`更新测验 ${params.id} 时出错:`, error);
    return NextResponse.json(
      { error: '更新测验失败', details: String(error) },
      { status: 500 }
    );
  }
}

// 删除特定ID的测验
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizzes = readJsonFile<Quiz[]>(QUIZZES_FILE, []);
    const initialLength = quizzes.length;
    
    // 过滤掉要删除的项目
    const updatedQuizzes = quizzes.filter(q => q.id !== params.id);
    
    if (updatedQuizzes.length === initialLength) {
      return NextResponse.json(
        { error: '测验不存在' },
        { status: 404 }
      );
    }
    
    // 保存更新后的数据
    if (writeJsonFile(QUIZZES_FILE, updatedQuizzes)) {
      return NextResponse.json({ success: true, message: '测验已删除' });
    } else {
      throw new Error('删除测验失败');
    }
  } catch (error) {
    console.error(`删除测验 ${params.id} 时出错:`, error);
    return NextResponse.json(
      { error: '删除测验失败', details: String(error) },
      { status: 500 }
    );
  }
} 