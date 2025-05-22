import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

// 测试数据目录和文件
const DATA_DIR = path.join(process.cwd(), 'data');
const TEST_DIR = path.join(DATA_DIR, 'test');
const TEST_FILE = path.join(TEST_DIR, 'test.json');

export async function GET() {
  const testResults = {
    dataDir: DATA_DIR,
    testDir: TEST_DIR,
    testFile: TEST_FILE,
    dirCreation: false,
    writeTest: false,
    readTest: false,
    deleteTest: false,
    content: null,
    errors: [] as string[]
  };
  
  try {
    // 测试创建目录
    if (!await exists(TEST_DIR)) {
      await mkdir(TEST_DIR, { recursive: true });
      testResults.dirCreation = true;
    } else {
      testResults.dirCreation = true;
    }
    
    // 测试写入文件
    const testData = { test: true, timestamp: Date.now() };
    await writeFile(TEST_FILE, JSON.stringify(testData, null, 2), 'utf8');
    testResults.writeTest = true;
    
    // 测试读取文件
    if (await exists(TEST_FILE)) {
      const fileContent = await readFile(TEST_FILE, 'utf8');
      testResults.content = JSON.parse(fileContent);
      testResults.readTest = true;
    }
    
    // 测试删除文件
    if (await exists(TEST_FILE)) {
      await unlink(TEST_FILE);
      testResults.deleteTest = true;
    }
    
    return NextResponse.json({
      success: testResults.dirCreation && testResults.writeTest && testResults.readTest && testResults.deleteTest,
      testResults
    });
  } catch (error) {
    testResults.errors.push(String(error));
    return NextResponse.json({
      success: false,
      testResults,
      error: String(error)
    }, { status: 500 });
  }
} 