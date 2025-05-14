import type { LearningMaterial, Quiz, Announcement, AppContent, QuizQuestion, QuizQuestionOption } from './types';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const createSampleQuestion = (id: string, text: string, options: string[], correct: number, explanation: string): QuizQuestion => ({
  id,
  questionText: text,
  options: options.map(opt => ({ text: opt })),
  correctOptionIndex: correct,
  explanation,
});

// 示例数据 - 仅用于展示，不会自动加载到系统中
export const sampleContent: AppContent = {
  learningMaterials: [
    { id: 'lm1', date: getTodayDateString(), title: 'Introduction to Algebra', content: 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols.' },
    { id: 'lm2', date: '2024-07-20', title: 'Understanding Photosynthesis', content: 'Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy.' },
  ],
  quizzes: [
    { 
      id: 'quiz1', 
      date: getTodayDateString(), 
      title: 'Daily Algebra Quiz', 
      questions: [
        createSampleQuestion('q1a', 'What is 2 + 2?', ['3', '4', '5', '6'], 1, 'The sum of 2 and 2 is 4.'),
        createSampleQuestion('q1b', 'Solve for x: x + 5 = 10', ['3', '4', '5', '10'], 2, 'Subtract 5 from both sides: x = 10 - 5, so x = 5.'),
      ]
    }
  ],
  announcements: [
    { id: 'an1', date: getTodayDateString(), message: 'Welcome to StudyQuest! New materials are posted daily.', publishedAt: Date.now() - 3600000 },
  ],
};

// 空内容 - 应用程序默认启动状态
export const emptyContent: AppContent = {
  learningMaterials: [],
  quizzes: [],
  announcements: []
};

// 内存存储 - 初始为空
let memoryStore: AppContent = {...emptyContent};

// 数据本地存储键名
const STORAGE_KEYS = {
  MATERIALS: 'studyquest-materials',
  QUIZZES: 'studyquest-quizzes',
  ANNOUNCEMENTS: 'studyquest-announcements'
};

// 辅助函数：从localStorage获取数据
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue; // 服务器端渲染时返回默认值
  }
  
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return defaultValue;
    
    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error(`从本地存储获取${key}时出错:`, error);
    return defaultValue;
  }
};

// 辅助函数：保存数据到localStorage
const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') {
    return; // 服务器端渲染时不执行
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`保存到本地存储${key}时出错:`, error);
  }
};

// 初始化数据存储 - 仅从localStorage加载，不添加模板数据
export const initializeDataStore = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return; // 服务器端不进行本地存储初始化
  }
  
  try {
    // 从本地存储加载数据（如果有）
    memoryStore = {
      learningMaterials: getFromStorage(STORAGE_KEYS.MATERIALS, []),
      quizzes: getFromStorage(STORAGE_KEYS.QUIZZES, []),
      announcements: getFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, [])
    };
    
    console.log('数据存储已初始化', {
      materialsCount: memoryStore.learningMaterials.length,
      quizzesCount: memoryStore.quizzes.length,
      announcementsCount: memoryStore.announcements.length
    });
  } catch (error) {
    console.error('初始化数据存储时出错:', error);
    // 出错时使用空内容
    memoryStore = {...emptyContent};
  }
};

// 学习材料相关操作
export const getLearningMaterialByDate = async (date: string): Promise<LearningMaterial | undefined> => {
  const materials = await getAllLearningMaterials();
  return materials.find(material => material.date === date);
};

export const getQuizByDate = async (date: string): Promise<Quiz | undefined> => {
  const quizzes = await getAllQuizzes();
  return quizzes.find(quiz => quiz.date === date);
};

export const getAnnouncements = async (limit: number = 5): Promise<Announcement[]> => {
  const announcements = await getAllAnnouncements();
  return [...announcements].sort((a,b) => b.publishedAt - a.publishedAt).slice(0, limit);
};

// 管理员功能：修改数据
export const addLearningMaterial = async (material: Omit<LearningMaterial, 'id'>): Promise<LearningMaterial> => {
  const newMaterial: LearningMaterial = { ...material, id: `lm${Date.now()}` };
  
  // 更新内存存储
  const updatedMaterials = [...memoryStore.learningMaterials, newMaterial];
  memoryStore.learningMaterials = updatedMaterials;
  
  // 更新本地存储
  saveToStorage(STORAGE_KEYS.MATERIALS, updatedMaterials);
  
  console.log('添加了新材料', newMaterial.title);
  return newMaterial;
};

export const updateLearningMaterial = async (updatedMaterial: LearningMaterial): Promise<LearningMaterial | undefined> => {
  // 检查材料是否存在
  const materialIndex = memoryStore.learningMaterials.findIndex(m => m.id === updatedMaterial.id);
  
  if (materialIndex >= 0) {
    // 更新内存存储
    const updatedMaterials = [...memoryStore.learningMaterials];
    updatedMaterials[materialIndex] = updatedMaterial;
    memoryStore.learningMaterials = updatedMaterials;
    
    // 更新本地存储
    saveToStorage(STORAGE_KEYS.MATERIALS, updatedMaterials);
    
    console.log('更新了材料', updatedMaterial.title);
    return updatedMaterial;
  }
  return undefined;
};

export const deleteLearningMaterial = async (materialId: string): Promise<boolean> => {
  try {
    // 更新内存存储
    const initialLength = memoryStore.learningMaterials.length;
    const updatedMaterials = memoryStore.learningMaterials.filter(m => m.id !== materialId);
    memoryStore.learningMaterials = updatedMaterials;
    
    // 更新本地存储
    saveToStorage(STORAGE_KEYS.MATERIALS, updatedMaterials);
    
    const deleted = updatedMaterials.length < initialLength;
    if (deleted) {
      console.log('删除了材料', materialId);
    }
    return deleted;
  } catch (error) {
    console.error(`删除学习材料 ${materialId} 时出错:`, error);
    return false;
  }
};

export const addQuiz = async (quiz: Omit<Quiz, 'id'>): Promise<Quiz> => {
  const newQuiz: Quiz = { ...quiz, id: `quiz${Date.now()}` };
  
  // 更新内存存储
  const updatedQuizzes = [...memoryStore.quizzes, newQuiz];
  memoryStore.quizzes = updatedQuizzes;
  
  // 更新本地存储
  saveToStorage(STORAGE_KEYS.QUIZZES, updatedQuizzes);
  
  console.log('添加了新测验', newQuiz.title);
  return newQuiz;
};

export const updateQuiz = async (updatedQuiz: Quiz): Promise<Quiz | undefined> => {
  // 检查测验是否存在
  const quizIndex = memoryStore.quizzes.findIndex(q => q.id === updatedQuiz.id);
  
  if (quizIndex >= 0) {
    // 更新内存存储
    const updatedQuizzes = [...memoryStore.quizzes];
    updatedQuizzes[quizIndex] = updatedQuiz;
    memoryStore.quizzes = updatedQuizzes;
    
    // 更新本地存储
    saveToStorage(STORAGE_KEYS.QUIZZES, updatedQuizzes);
    
    console.log('更新了测验', updatedQuiz.title);
    return updatedQuiz;
  }
  return undefined;
};

export const deleteQuiz = async (quizId: string): Promise<boolean> => {
  try {
    // 更新内存存储
    const initialLength = memoryStore.quizzes.length;
    const updatedQuizzes = memoryStore.quizzes.filter(q => q.id !== quizId);
    memoryStore.quizzes = updatedQuizzes;
    
    // 更新本地存储
    saveToStorage(STORAGE_KEYS.QUIZZES, updatedQuizzes);
    
    const deleted = updatedQuizzes.length < initialLength;
    if (deleted) {
      console.log('删除了测验', quizId);
    }
    return deleted;
  } catch (error) {
    console.error(`删除测验 ${quizId} 时出错:`, error);
    return false;
  }
};

export const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'publishedAt'>): Promise<Announcement> => {
  const newAnnouncement: Announcement = { 
    ...announcement, 
    id: `an${Date.now()}`, 
    publishedAt: Date.now() 
  };
  
  // 更新内存存储
  const updatedAnnouncements = [...memoryStore.announcements, newAnnouncement];
  memoryStore.announcements = updatedAnnouncements;
  
  // 更新本地存储
  saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, updatedAnnouncements);
  
  console.log('添加了新公告', newAnnouncement.message.substring(0, 30) + (newAnnouncement.message.length > 30 ? '...' : ''));
  return newAnnouncement;
};

export const deleteAnnouncement = async (announcementId: string): Promise<boolean> => {
  try {
    // 更新内存存储
    const initialLength = memoryStore.announcements.length;
    const updatedAnnouncements = memoryStore.announcements.filter(a => a.id !== announcementId);
    memoryStore.announcements = updatedAnnouncements;
    
    // 更新本地存储
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, updatedAnnouncements);
    
    const deleted = updatedAnnouncements.length < initialLength;
    if (deleted) {
      console.log('删除了公告', announcementId);
    }
    return deleted;
  } catch (error) {
    console.error(`删除公告 ${announcementId} 时出错:`, error);
    return false;
  }
};

export const updateAnnouncement = async (updatedAnnouncement: Announcement): Promise<Announcement | undefined> => {
  // 检查公告是否存在
  const announcementIndex = memoryStore.announcements.findIndex(a => a.id === updatedAnnouncement.id);
  
  if (announcementIndex >= 0) {
    // 更新内存存储
    const updatedAnnouncements = [...memoryStore.announcements];
    updatedAnnouncements[announcementIndex] = updatedAnnouncement;
    memoryStore.announcements = updatedAnnouncements;
    
    // 更新本地存储
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, updatedAnnouncements);
    
    console.log('更新了公告', updatedAnnouncement.message.substring(0, 30) + (updatedAnnouncement.message.length > 30 ? '...' : ''));
    return updatedAnnouncement;
  }
  return undefined;
};

// Webhook更新函数
export const updateDailyContentViaWebhook = async (data: { date: string, material?: Partial<LearningMaterial>, quiz?: Partial<Quiz>, announcement?: Partial<Announcement> }): Promise<boolean> => {
  const { date, material, quiz, announcement } = data;
  let materialUpdated = false;
  let quizUpdated = false;
  let announcementUpdated = false;

  // 处理学习材料更新
  if (material) {
    const existingMaterialIndex = memoryStore.learningMaterials.findIndex(m => m.date === date);
    
    if (existingMaterialIndex >= 0) {
      // 更新现有材料
      const updatedMaterials = [...memoryStore.learningMaterials];
      updatedMaterials[existingMaterialIndex] = { 
        ...updatedMaterials[existingMaterialIndex], 
        ...material 
      };
      memoryStore.learningMaterials = updatedMaterials;
      saveToStorage(STORAGE_KEYS.MATERIALS, updatedMaterials);
    } else if (material.title && material.content) {
      // 创建新材料 (确保有必要字段)
      const newMaterial: LearningMaterial = { 
        id: `lm-wh-${Date.now()}`, 
        date, 
        title: material.title, 
        content: material.content
      };
      const updatedMaterials = [...memoryStore.learningMaterials, newMaterial];
      memoryStore.learningMaterials = updatedMaterials;
      saveToStorage(STORAGE_KEYS.MATERIALS, updatedMaterials);
    }
    materialUpdated = true;
  }

  // 处理测验更新
  if (quiz) {
    const existingQuizIndex = memoryStore.quizzes.findIndex(q => q.date === date);
    
    if (existingQuizIndex >= 0) {
      // 更新现有测验
      const updatedQuizzes = [...memoryStore.quizzes];
      updatedQuizzes[existingQuizIndex] = { 
        ...updatedQuizzes[existingQuizIndex], 
        ...quiz 
      };
      memoryStore.quizzes = updatedQuizzes;
      saveToStorage(STORAGE_KEYS.QUIZZES, updatedQuizzes);
    } else if (quiz.questions && quiz.title) {
      // 创建新测验 (确保有必要字段)
      const newQuiz: Quiz = { 
        id: `quiz-wh-${Date.now()}`, 
        date, 
        title: quiz.title, 
        questions: quiz.questions
      };
      const updatedQuizzes = [...memoryStore.quizzes, newQuiz];
      memoryStore.quizzes = updatedQuizzes;
      saveToStorage(STORAGE_KEYS.QUIZZES, updatedQuizzes);
    }
    quizUpdated = true;
  }
  
  // 处理公告更新
  if (announcement && announcement.message) {
    const newAnnouncement: Announcement = {
      id: `an-wh-${Date.now()}`,
      date,
      message: announcement.message,
      publishedAt: Date.now()
    };
    const updatedAnnouncements = [...memoryStore.announcements, newAnnouncement];
    memoryStore.announcements = updatedAnnouncements;
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, updatedAnnouncements);
    announcementUpdated = true;
  }
  
  console.log("Webhook处理完成。内容已更新。");
  return materialUpdated || quizUpdated || announcementUpdated;
};

// 获取所有数据的函数
export const getAllLearningMaterials = async (): Promise<LearningMaterial[]> => {
  // 如果内存中无数据，尝试从本地存储加载
  if (memoryStore.learningMaterials.length === 0 && typeof window !== 'undefined') {
    memoryStore.learningMaterials = getFromStorage(STORAGE_KEYS.MATERIALS, []);
  }
  return [...memoryStore.learningMaterials];
}

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  // 如果内存中无数据，尝试从本地存储加载
  if (memoryStore.quizzes.length === 0 && typeof window !== 'undefined') {
    memoryStore.quizzes = getFromStorage(STORAGE_KEYS.QUIZZES, []);
  }
  return [...memoryStore.quizzes];
}

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  // 如果内存中无数据，尝试从本地存储加载
  if (memoryStore.announcements.length === 0 && typeof window !== 'undefined') {
    memoryStore.announcements = getFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, []);
  }
  return [...memoryStore.announcements];
}

// 清除所有数据，重置为空状态
export const clearAllData = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false; // 服务器端不执行
  }
  
  try {
    // 清除内存数据
    memoryStore = {...emptyContent};
    
    // 清除本地存储
    localStorage.removeItem(STORAGE_KEYS.MATERIALS);
    localStorage.removeItem(STORAGE_KEYS.QUIZZES);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
    
    console.log('所有数据已清除');
    return true;
  } catch (error) {
    console.error('清除数据时出错:', error);
    return false;
  }
};


