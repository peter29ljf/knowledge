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

// 获取特定ID的公告
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcements = readJsonFile<Announcement[]>(ANNOUNCEMENTS_FILE, []);
    const announcement = announcements.find(a => a.id === params.id);
    
    if (!announcement) {
      return NextResponse.json(
        { error: '公告不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(announcement);
  } catch (error) {
    console.error(`获取公告 ${params.id} 时出错:`, error);
    return NextResponse.json(
      { error: '获取公告失败', details: String(error) },
      { status: 500 }
    );
  }
}

// 更新特定ID的公告
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcements = readJsonFile<Announcement[]>(ANNOUNCEMENTS_FILE, []);
    const updatedAnnouncement = await request.json();
    
    // 确保ID匹配
    if (updatedAnnouncement.id !== params.id) {
      return NextResponse.json(
        { error: 'ID不匹配' },
        { status: 400 }
      );
    }
    
    const announcementIndex = announcements.findIndex(a => a.id === params.id);
    
    if (announcementIndex === -1) {
      return NextResponse.json(
        { error: '公告不存在' },
        { status: 404 }
      );
    }
    
    // 保留原始发布时间
    if (!updatedAnnouncement.publishedAt) {
      updatedAnnouncement.publishedAt = announcements[announcementIndex].publishedAt;
    }
    
    // 更新公告
    announcements[announcementIndex] = updatedAnnouncement;
    
    // 保存更新后的数据
    if (writeJsonFile(ANNOUNCEMENTS_FILE, announcements)) {
      return NextResponse.json(updatedAnnouncement);
    } else {
      throw new Error('保存公告失败');
    }
  } catch (error) {
    console.error(`更新公告 ${params.id} 时出错:`, error);
    return NextResponse.json(
      { error: '更新公告失败', details: String(error) },
      { status: 500 }
    );
  }
}

// 删除特定ID的公告
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcements = readJsonFile<Announcement[]>(ANNOUNCEMENTS_FILE, []);
    const initialLength = announcements.length;
    
    // 过滤掉要删除的项目
    const updatedAnnouncements = announcements.filter(a => a.id !== params.id);
    
    if (updatedAnnouncements.length === initialLength) {
      return NextResponse.json(
        { error: '公告不存在' },
        { status: 404 }
      );
    }
    
    // 保存更新后的数据
    if (writeJsonFile(ANNOUNCEMENTS_FILE, updatedAnnouncements)) {
      return NextResponse.json({ success: true, message: '公告已删除' });
    } else {
      throw new Error('删除公告失败');
    }
  } catch (error) {
    console.error(`删除公告 ${params.id} 时出错:`, error);
    return NextResponse.json(
      { error: '删除公告失败', details: String(error) },
      { status: 500 }
    );
  }
} 