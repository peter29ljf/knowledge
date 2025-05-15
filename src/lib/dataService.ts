import type { 
  LearningMaterial, 
  Quiz, 
  Announcement, 
  AppContent, 
  QuizQuestion,
  QuizAttempt,
  AdminMessage,
  UserScoreData
} from './types';

// 缓存 - 用于减少API请求
let materialsCache: LearningMaterial[] | null = null;
let quizzesCache: Quiz[] | null = null;
let announcementsCache: Announcement[] | null = null;
let configCache: any = null;
let userRegistryCache: any = null;

// API端点
const API_ENDPOINTS = {
  INIT: '/api/data/init',
  LEARNING_MATERIALS: '/api/data/learning-materials',
  QUIZZES: '/api/data/quizzes',
  ANNOUNCEMENTS: '/api/data/announcements',
  CONFIG: '/api/data/config',
  USER_REGISTRY: '/api/data/user-registry',
  USER_DATA: '/api/data/user'
};

// 帮助函数：安全地发起API请求并返回JSON
const fetchFromApi = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`API请求出错 ${url}:`, error);
    throw error;
  }
};

// 初始化数据存储
export const initializeDataStore = async (): Promise<void> => {
  try {
    // 通过API初始化数据
    await fetchFromApi(API_ENDPOINTS.INIT, {
      method: 'POST'
    });
    
    // 加载缓存
    materialsCache = await getAllLearningMaterials();
    quizzesCache = await getAllQuizzes();
    announcementsCache = await getAllAnnouncements();
    configCache = await getConfig();
    userRegistryCache = await getUserRegistry();
    
    console.log('数据存储已初始化', {
      materialsCount: materialsCache.length,
      quizzesCount: quizzesCache.length,
      announcementsCount: announcementsCache.length,
      usersCount: userRegistryCache.users?.length || 0
    });
  } catch (error) {
    console.error('初始化数据存储时出错:', error);
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

// 获取用户的公告阅读状态
export const getAnnouncementStatus = async (userId: string): Promise<{ read_announcements: string[], last_viewed: string }> => {
  const response = await fetchFromApi<{ read_announcements: string[], last_viewed: string }>(
    `${API_ENDPOINTS.USER_DATA}/${userId}/announcement-status`
  );
  return response;
};

// 更新用户的公告阅读状态
export const updateAnnouncementStatus = async (
  userId: string, 
  readIds: string[]
): Promise<boolean> => {
  try {
    await fetchFromApi(`${API_ENDPOINTS.USER_DATA}/${userId}/announcement-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readIds })
    });
    return true;
  } catch (error) {
    console.error('更新公告状态出错:', error);
    return false;
  }
};

// 管理员功能：添加学习材料
export const addLearningMaterial = async (material: Omit<LearningMaterial, 'id'>): Promise<LearningMaterial> => {
  const newMaterial = await fetchFromApi<LearningMaterial>(API_ENDPOINTS.LEARNING_MATERIALS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(material)
  });
  
  // 更新缓存
  if (materialsCache) {
    materialsCache = [...materialsCache, newMaterial];
  }
  
  console.log('添加了新材料', newMaterial.title);
  return newMaterial;
};

// 管理员功能：更新学习材料
export const updateLearningMaterial = async (updatedMaterial: LearningMaterial): Promise<LearningMaterial | undefined> => {
  try {
    const result = await fetchFromApi<LearningMaterial>(`${API_ENDPOINTS.LEARNING_MATERIALS}/${updatedMaterial.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMaterial)
    });
    
    // 更新缓存
    if (materialsCache) {
      materialsCache = materialsCache.map(m => 
        m.id === updatedMaterial.id ? updatedMaterial : m
      );
    }
    
    console.log('更新了材料', updatedMaterial.title);
    return result;
  } catch (error) {
    console.error('更新学习材料出错:', error);
    return undefined;
  }
};

// 管理员功能：删除学习材料
export const deleteLearningMaterial = async (materialId: string): Promise<boolean> => {
  try {
    await fetchFromApi(`${API_ENDPOINTS.LEARNING_MATERIALS}/${materialId}`, {
      method: 'DELETE'
    });
    
    // 更新缓存
    if (materialsCache) {
      materialsCache = materialsCache.filter(m => m.id !== materialId);
    }
    
    console.log('删除了材料', materialId);
    return true;
  } catch (error) {
    console.error(`删除学习材料出错:`, error);
    return false;
  }
};

// 测验相关操作
export const addQuiz = async (quiz: Omit<Quiz, 'id'>): Promise<Quiz> => {
  const newQuiz = await fetchFromApi<Quiz>(API_ENDPOINTS.QUIZZES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quiz)
  });
  
  // 更新缓存
  if (quizzesCache) {
    quizzesCache = [...quizzesCache, newQuiz];
  }
  
  console.log('添加了新测验', newQuiz.title);
  return newQuiz;
};

export const updateQuiz = async (updatedQuiz: Quiz): Promise<Quiz | undefined> => {
  try {
    const result = await fetchFromApi<Quiz>(`${API_ENDPOINTS.QUIZZES}/${updatedQuiz.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedQuiz)
    });
    
    // 更新缓存
    if (quizzesCache) {
      quizzesCache = quizzesCache.map(q => 
        q.id === updatedQuiz.id ? updatedQuiz : q
      );
    }
    
    console.log('更新了测验', updatedQuiz.title);
    return result;
  } catch (error) {
    console.error('更新测验出错:', error);
    return undefined;
  }
};

export const deleteQuiz = async (quizId: string): Promise<boolean> => {
  try {
    await fetchFromApi(`${API_ENDPOINTS.QUIZZES}/${quizId}`, {
      method: 'DELETE'
    });
    
    // 更新缓存
    if (quizzesCache) {
      quizzesCache = quizzesCache.filter(q => q.id !== quizId);
    }
    
    console.log('删除了测验', quizId);
    return true;
  } catch (error) {
    console.error(`删除测验出错:`, error);
    return false;
  }
};

// 公告相关操作
export const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'publishedAt'>): Promise<Announcement> => {
  const newAnnouncement = await fetchFromApi<Announcement>(API_ENDPOINTS.ANNOUNCEMENTS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(announcement)
  });
  
  // 更新缓存
  if (announcementsCache) {
    announcementsCache = [...announcementsCache, newAnnouncement];
  }
  
  console.log('添加了新公告');
  return newAnnouncement;
};

export const deleteAnnouncement = async (announcementId: string): Promise<boolean> => {
  try {
    await fetchFromApi(`${API_ENDPOINTS.ANNOUNCEMENTS}/${announcementId}`, {
      method: 'DELETE'
    });
    
    // 更新缓存
    if (announcementsCache) {
      announcementsCache = announcementsCache.filter(a => a.id !== announcementId);
    }
    
    console.log('删除了公告', announcementId);
    return true;
  } catch (error) {
    console.error(`删除公告出错:`, error);
    return false;
  }
};

export const updateAnnouncement = async (updatedAnnouncement: Announcement): Promise<Announcement | undefined> => {
  try {
    const result = await fetchFromApi<Announcement>(`${API_ENDPOINTS.ANNOUNCEMENTS}/${updatedAnnouncement.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedAnnouncement)
    });
    
    // 更新缓存
    if (announcementsCache) {
      announcementsCache = announcementsCache.map(a => 
        a.id === updatedAnnouncement.id ? updatedAnnouncement : a
      );
    }
    
    console.log('更新了公告');
    return result;
  } catch (error) {
    console.error('更新公告出错:', error);
    return undefined;
  }
};

// 用户测验尝试相关操作
export const saveQuizAttempt = async (
  userId: string,
  quizAttempt: Omit<QuizAttempt, 'timestamp'>
): Promise<QuizAttempt> => {
  const newAttempt = await fetchFromApi<QuizAttempt>(`${API_ENDPOINTS.USER_DATA}/${userId}/quiz-attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quizAttempt)
  });
  
  return newAttempt;
};

// 获取用户的测验尝试记录
export const getQuizAttempts = async (userId: string): Promise<QuizAttempt[]> => {
  return fetchFromApi<QuizAttempt[]>(`${API_ENDPOINTS.USER_DATA}/${userId}/quiz-attempts`);
};

// 用户积分相关操作
export const getUserScore = async (userId: string): Promise<UserScoreData> => {
  return fetchFromApi<UserScoreData>(`${API_ENDPOINTS.USER_DATA}/${userId}/score`);
};

export const updateUserScore = async (
  userId: string,
  pointsToAdd: number,
  attempt: QuizAttempt
): Promise<UserScoreData> => {
  return fetchFromApi<UserScoreData>(`${API_ENDPOINTS.USER_DATA}/${userId}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pointsToAdd, attempt })
  });
};

// 用户消息相关操作
export const saveUserMessage = async (
  userId: string,
  message: string
): Promise<AdminMessage> => {
  return fetchFromApi<AdminMessage>(`${API_ENDPOINTS.USER_DATA}/${userId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
};

export const getUserMessages = async (userId: string): Promise<AdminMessage[]> => {
  return fetchFromApi<AdminMessage[]>(`${API_ENDPOINTS.USER_DATA}/${userId}/messages`);
};

export const updateUserMessageReadStatus = async (
  userId: string,
  messageId: string,
  isRead: boolean = true
): Promise<boolean> => {
  try {
    await fetchFromApi(`${API_ENDPOINTS.USER_DATA}/${userId}/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead })
    });
    return true;
  } catch (error) {
    console.error('更新消息状态出错:', error);
    return false;
  }
};

// Webhook更新函数
export const updateDailyContentViaWebhook = async (
  data: { 
    date: string, 
    material?: Partial<LearningMaterial>, 
    quiz?: Partial<Quiz>, 
    announcement?: Partial<Announcement> 
  }
): Promise<boolean> => {
  try {
    await fetchFromApi('/api/webhook/daily-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return true;
  } catch (error) {
    console.error('Webhook更新出错:', error);
    return false;
  }
};

// 获取所有数据
export const getAllLearningMaterials = async (): Promise<LearningMaterial[]> => {
  if (!materialsCache) {
    materialsCache = await fetchFromApi<LearningMaterial[]>(API_ENDPOINTS.LEARNING_MATERIALS);
  }
  return [...materialsCache];
};

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  if (!quizzesCache) {
    quizzesCache = await fetchFromApi<Quiz[]>(API_ENDPOINTS.QUIZZES);
  }
  return [...quizzesCache];
};

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  if (!announcementsCache) {
    announcementsCache = await fetchFromApi<Announcement[]>(API_ENDPOINTS.ANNOUNCEMENTS);
  }
  return [...announcementsCache];
};

// 获取系统配置
export const getConfig = async (): Promise<any> => {
  if (!configCache) {
    configCache = await fetchFromApi(API_ENDPOINTS.CONFIG);
  }
  return { ...configCache };
};

// 获取用户注册表
export const getUserRegistry = async (): Promise<any> => {
  if (!userRegistryCache) {
    userRegistryCache = await fetchFromApi(API_ENDPOINTS.USER_REGISTRY);
  }
  return { ...userRegistryCache };
};

// 清除所有数据，重置为空状态
export const clearAllData = async (): Promise<boolean> => {
  try {
    await fetchFromApi('/api/data/clear', { method: 'POST' });
    
    // 重置缓存
    materialsCache = [];
    quizzesCache = [];
    announcementsCache = [];
    
    console.log('所有数据已清除');
    return true;
  } catch (error) {
    console.error('清除数据时出错:', error);
    return false;
  }
};


