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

// 获取特定ID的学习材料
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const materials = readJsonFile<LearningMaterial[]>(LEARNING_MATERIALS_FILE, []);
    const material = materials.find(m => m.id === params.id);
    
    if (!material) {
      return NextResponse.json(
        { error: '学习材料不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(material);
  } catch (error) {
    console.error(`获取学习材料 ${params.id} 时出错:`, error);
    return NextResponse.json(
      { error: '获取学习材料失败', details: String(error) },
      { status: 500 }
    );
  }
}

// 更新特定ID的学习材料
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const materials = readJsonFile<LearningMaterial[]>(LEARNING_MATERIALS_FILE, []);
    const updatedMaterial = await request.json();
    
    // 确保ID匹配
    if (updatedMaterial.id !== params.id) {
      return NextResponse.json(
        { error: 'ID不匹配' },
        { status: 400 }
      );
    }
    
    const materialIndex = materials.findIndex(m => m.id === params.id);
    
    if (materialIndex === -1) {
      return NextResponse.json(
        { error: '学习材料不存在' },
        { status: 404 }
      );
    }
    
    // 更新材料
    materials[materialIndex] = updatedMaterial;
    
    // 保存更新后的数据
    if (writeJsonFile(LEARNING_MATERIALS_FILE, materials)) {
      return NextResponse.json(updatedMaterial);
    } else {
      throw new Error('保存学习材料失败');
    }
  } catch (error) {
    console.error(`更新学习材料 ${params.id} 时出错:`, error);
    return NextResponse.json(
      { error: '更新学习材料失败', details: String(error) },
      { status: 500 }
    );
  }
}

// 删除特定ID的学习材料
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const materials = readJsonFile<LearningMaterial[]>(LEARNING_MATERIALS_FILE, []);
    const initialLength = materials.length;
    
    // 过滤掉要删除的项目
    const updatedMaterials = materials.filter(m => m.id !== params.id);
    
    if (updatedMaterials.length === initialLength) {
      return NextResponse.json(
        { error: '学习材料不存在' },
        { status: 404 }
      );
    }
    
    // 保存更新后的数据
    if (writeJsonFile(LEARNING_MATERIALS_FILE, updatedMaterials)) {
      return NextResponse.json({ success: true, message: '学习材料已删除' });
    } else {
      throw new Error('删除学习材料失败');
    }
  } catch (error) {
    console.error(`删除学习材料 ${params.id} 时出错:`, error);
    return NextResponse.json(
      { error: '删除学习材料失败', details: String(error) },
      { status: 500 }
    );
  }
} 