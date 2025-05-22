import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 路径常量
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const PUBLIC_DIR = path.join(DATA_DIR, 'public');
const SYSTEM_DIR = path.join(DATA_DIR, 'system');

// 用于确保初始化只运行一次的标志
let initialized = false;

// 服务端安全地读取JSON文件
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

export async function POST() {
  if (!initialized) {
    try {
      console.log('初始化数据开始...');
      
      // 确保所有必要的目录存在
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(USERS_DIR)) {
        fs.mkdirSync(USERS_DIR, { recursive: true });
      }
      if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR, { recursive: true });
      }
      if (!fs.existsSync(SYSTEM_DIR)) {
        fs.mkdirSync(SYSTEM_DIR, { recursive: true });
      }
      
      // 加载初始数据文件
      const learningMaterialsPath = path.join(PUBLIC_DIR, 'learning-materials.json');
      const quizzesPath = path.join(PUBLIC_DIR, 'quizzes.json');
      const announcementsPath = path.join(PUBLIC_DIR, 'announcements.json');
      const configPath = path.join(SYSTEM_DIR, 'config.json');
      const userRegistryPath = path.join(SYSTEM_DIR, 'user-registry.json');
      
      // 确保文件存在
      if (!fs.existsSync(learningMaterialsPath)) {
        fs.writeFileSync(learningMaterialsPath, JSON.stringify([]), 'utf-8');
      }
      if (!fs.existsSync(quizzesPath)) {
        fs.writeFileSync(quizzesPath, JSON.stringify([]), 'utf-8');
      }
      if (!fs.existsSync(announcementsPath)) {
        fs.writeFileSync(announcementsPath, JSON.stringify([]), 'utf-8');
      }
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ version: "0.0.1" }), 'utf-8');
      }
      if (!fs.existsSync(userRegistryPath)) {
        fs.writeFileSync(userRegistryPath, JSON.stringify({ users: [] }), 'utf-8');
      }
      
      initialized = true;
      console.log('数据初始化完成！');
      
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