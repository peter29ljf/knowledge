import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 路径常量
const PUBLIC_DIR = path.join(process.cwd(), 'data/public');
const LEARNING_MATERIALS_FILE = path.join(PUBLIC_DIR, 'learning-materials.json');
const QUIZZES_FILE = path.join(PUBLIC_DIR, 'quizzes.json');
const ANNOUNCEMENTS_FILE = path.join(PUBLIC_DIR, 'announcements.json');

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

// 清除所有公共数据
export async function POST() {
  try {
    // 重置所有文件为空数组
    writeJsonFile(LEARNING_MATERIALS_FILE, []);
    writeJsonFile(QUIZZES_FILE, []);
    writeJsonFile(ANNOUNCEMENTS_FILE, []);
    
    console.log('所有数据已清除');
    return NextResponse.json({ success: true, message: '所有数据已清除' });
  } catch (error) {
    console.error('清除数据时出错:', error);
    return NextResponse.json(
      { error: '清除数据失败', details: String(error) },
      { status: 500 }
    );
  }
} 