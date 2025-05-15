import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 路径常量
const SYSTEM_DIR = path.join(process.cwd(), 'data/system');
const USER_REGISTRY_FILE = path.join(SYSTEM_DIR, 'user-registry.json');

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

// 获取用户注册表
export async function GET() {
  try {
    const userRegistry = readJsonFile(USER_REGISTRY_FILE, { users: [] });
    return NextResponse.json(userRegistry);
  } catch (error) {
    console.error('获取用户注册表时出错:', error);
    return NextResponse.json(
      { error: '获取用户注册表失败', details: String(error) },
      { status: 500 }
    );
  }
} 