import { initializeDataStore } from './dataService';

// 在服务器端初始化数据
export const initializeData = async (): Promise<void> => {
  try {
    console.log('正在初始化数据存储...');
    await initializeDataStore();
    console.log('数据存储初始化完成！');
  } catch (error) {
    console.error('初始化数据存储时出错:', error);
  }
};

// 在这里导出一个默认函数，方便在其他地方导入并执行
export default initializeData; 