const fs = require('fs');
const path = require('path');

// 数据目录路径 - 直接使用绝对路径
const DATA_DIR = path.join(__dirname, '../../data');
const TEST_FILE = path.join(DATA_DIR, 'test_file.json');

// 确保目录存在
function ensureDirectoryExists(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`目录 ${dir} 已创建`);
    } else {
      console.log(`目录 ${dir} 已存在`);
    }
  } catch (error) {
    console.error(`创建目录 ${dir} 时出错:`, error);
  }
}

// 测试写入文件
function testWriteFile() {
  try {
    const testData = {
      test: true,
      timestamp: Date.now(),
      message: '这是一个测试文件，用于验证文件系统权限'
    };

    fs.writeFileSync(TEST_FILE, JSON.stringify(testData, null, 2), 'utf8');
    console.log(`测试文件已写入到 ${TEST_FILE}`);
    return true;
  } catch (error) {
    console.error('写入测试文件时出错:', error);
    return false;
  }
}

// 测试读取文件
function testReadFile() {
  try {
    if (fs.existsSync(TEST_FILE)) {
      const fileContent = fs.readFileSync(TEST_FILE, 'utf8');
      const data = JSON.parse(fileContent);
      console.log('成功读取测试文件内容:', data);
      return true;
    } else {
      console.error('测试文件不存在');
      return false;
    }
  } catch (error) {
    console.error('读取测试文件时出错:', error);
    return false;
  }
}

// 测试删除文件
function testDeleteFile() {
  try {
    if (fs.existsSync(TEST_FILE)) {
      fs.unlinkSync(TEST_FILE);
      console.log('测试文件已成功删除');
      return true;
    } else {
      console.log('测试文件不存在，无需删除');
      return false;
    }
  } catch (error) {
    console.error('删除测试文件时出错:', error);
    return false;
  }
}

// 运行所有测试
function runAllTests() {
  console.log('====== 开始文件系统访问测试 ======');
  console.log(`当前目录: ${__dirname}`);
  console.log(`数据目录路径: ${DATA_DIR}`);
  
  ensureDirectoryExists(DATA_DIR);
  
  console.log('\n----- 测试文件写入 -----');
  const writeResult = testWriteFile();
  
  console.log('\n----- 测试文件读取 -----');
  const readResult = testReadFile();
  
  console.log('\n----- 测试文件删除 -----');
  const deleteResult = testDeleteFile();
  
  console.log('\n====== 测试结果汇总 ======');
  console.log(`写入测试: ${writeResult ? '成功 ✅' : '失败 ❌'}`);
  console.log(`读取测试: ${readResult ? '成功 ✅' : '失败 ❌'}`);
  console.log(`删除测试: ${deleteResult ? '成功 ✅' : '失败 ❌'}`);
  
  if (writeResult && readResult && deleteResult) {
    console.log('\n✅ 所有测试通过！文件系统访问正常。');
  } else {
    console.log('\n❌ 部分测试失败！请检查文件系统权限和路径配置。');
  }
}

// 立即运行测试
runAllTests();

// 导出测试函数
module.exports = {
  runAllTests,
  ensureDirectoryExists,
  testWriteFile,
  testReadFile,
  testDeleteFile
}; 