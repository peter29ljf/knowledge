import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { LearningMaterial } from '@/lib/types';

// 路径常量
const PUBLIC_DIR = path.join(process.cwd(), 'data/public');
const LEARNING_MATERIALS_FILE = path.join(PUBLIC_DIR, 'learning-materials.json');

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

// 获取所有学习材料
export async function GET() {
  try {
    const materials = readJsonFile<LearningMaterial[]>(LEARNING_MATERIALS_FILE, []);
    return NextResponse.json(materials);
  } catch (error) {
    console.error('获取学习材料时出错:', error);
    return NextResponse.json(
      { error: '获取学习材料失败', details: String(error) },
      { status: 500 }
    );
  }
}

// 添加新的学习材料
export async function POST(request: NextRequest) {
  try {
    const materials = readJsonFile<LearningMaterial[]>(LEARNING_MATERIALS_FILE, []);
    const material = await request.json();
    
    // 生成新ID
    const newMaterial: LearningMaterial = { 
      ...material, 
      id: `lm-${Date.now()}` 
    };
    
    // 添加到现有数据
    materials.push(newMaterial);
    
    // 保存更新后的数据
    if (writeJsonFile(LEARNING_MATERIALS_FILE, materials)) {
      return NextResponse.json(newMaterial, { status: 201 });
    } else {
      throw new Error('保存学习材料失败');
    }
  } catch (error) {
    console.error('添加学习材料时出错:', error);
    return NextResponse.json(
      { error: '添加学习材料失败', details: String(error) },
      { status: 500 }
    );
  }
} 