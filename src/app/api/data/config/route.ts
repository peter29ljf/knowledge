import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 路径常量
const SYSTEM_DIR = path.join(process.cwd(), 'data/system');
const CONFIG_FILE = path.join(SYSTEM_DIR, 'config.json');

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

// 获取系统配置
export async function GET() {
  try {
    const config = readJsonFile(CONFIG_FILE, { version: "0.0.1" });
    return NextResponse.json(config);
  } catch (error) {
    console.error('获取系统配置时出错:', error);
    return NextResponse.json(
      { error: '获取系统配置失败', details: String(error) },
      { status: 500 }
    );
  }
} 