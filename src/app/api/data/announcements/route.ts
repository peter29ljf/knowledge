import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Announcement } from '@/lib/types';

// 路径常量
const PUBLIC_DIR = path.join(process.cwd(), 'data/public');
const ANNOUNCEMENTS_FILE = path.join(PUBLIC_DIR, 'announcements.json');

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

// 获取所有公告
export async function GET() {
  try {
    const announcements = readJsonFile<Announcement[]>(ANNOUNCEMENTS_FILE, []);
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('获取公告时出错:', error);
    return NextResponse.json(
      { error: '获取公告失败', details: String(error) },
      { status: 500 }
    );
  }
}

// 添加新的公告
export async function POST(request: NextRequest) {
  try {
    const announcements = readJsonFile<Announcement[]>(ANNOUNCEMENTS_FILE, []);
    const announcement = await request.json();
    
    // 生成新ID和发布时间
    const newAnnouncement: Announcement = { 
      ...announcement, 
      id: `an-${Date.now()}`,
      publishedAt: Date.now()
    };
    
    // 添加到现有数据
    announcements.push(newAnnouncement);
    
    // 保存更新后的数据
    if (writeJsonFile(ANNOUNCEMENTS_FILE, announcements)) {
      return NextResponse.json(newAnnouncement, { status: 201 });
    } else {
      throw new Error('保存公告失败');
    }
  } catch (error) {
    console.error('添加公告时出错:', error);
    return NextResponse.json(
      { error: '添加公告失败', details: String(error) },
      { status: 500 }
    );
  }
} 