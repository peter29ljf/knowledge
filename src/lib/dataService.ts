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

let mockContent: AppContent = {
  learningMaterials: [
    { id: 'lm1', date: getTodayDateString(), title: 'Introduction to Algebra', content: 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols.' },
    { id: 'lm2', date: '2024-07-20', title: 'Understanding Photosynthesis', content: 'Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy.' },
    { id: 'lm_2024_05_10', date: '2024-05-10', title: 'Basic Geometry: Shapes and Angles', content: "Geometry is the branch of mathematics concerned with the properties and relations of points, lines, surfaces, solids, and higher dimensional analogues. Today we'll focus on basic 2D shapes like triangles, squares, circles, and understanding different types of angles (acute, obtuse, right)." },
  ],
  quizzes: [
    { 
      id: 'quiz1', 
      date: getTodayDateString(), 
      title: 'Daily Algebra Quiz', 
      questions: [
        createSampleQuestion('q1a', 'What is 2 + 2?', ['3', '4', '5', '6'], 1, 'The sum of 2 and 2 is 4.'),
        createSampleQuestion('q1b', 'Solve for x: x + 5 = 10', ['3', '4', '5', '10'], 2, 'Subtract 5 from both sides: x = 10 - 5, so x = 5.'),
        createSampleQuestion('q1c', 'What is 3 * 3?', ['6', '9', '12', '33'], 1, '3 multiplied by 3 is 9.'),
        createSampleQuestion('q1d', 'Is 7 a prime number?', ['Yes', 'No'], 0, 'A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. 7 fits this definition.'),
        createSampleQuestion('q1e', 'What is the square root of 16?', ['2', '4', '8', '16'], 1, 'The square root of 16 is 4, because 4 * 4 = 16.'),
      ]
    },
    { 
      id: 'quiz2', 
      date: '2024-07-20', 
      title: 'Photosynthesis Basics', 
      questions: [
        createSampleQuestion('q2a', 'What gas do plants absorb during photosynthesis?', ['Oxygen', 'Carbon Dioxide', 'Nitrogen'], 1, 'Plants absorb Carbon Dioxide (CO2) for photosynthesis.'),
        createSampleQuestion('q2b', 'What is the primary pigment used in photosynthesis?', ['Chlorophyll', 'Carotene', 'Xanthophyll'], 0, 'Chlorophyll is the primary pigment that captures light energy.'),
      ]
    },
     { 
      id: 'quiz_2024_05_10', 
      date: '2024-05-10', 
      title: 'Daily Geometry Challenge', 
      questions: [
        createSampleQuestion('q_geo_1', 'How many sides does a triangle have?', ['2', '3', '4', '5'], 1, 'A triangle is a polygon with three edges and three vertices.'),
        createSampleQuestion('q_geo_2', 'What is the sum of angles in a triangle?', ['90 degrees', '180 degrees', '270 degrees', '360 degrees'], 1, 'The sum of the interior angles of a triangle always adds up to 180 degrees.'),
        createSampleQuestion('q_geo_3', 'An angle less than 90 degrees is called?', ['Obtuse angle', 'Right angle', 'Acute angle', 'Reflex angle'], 2, 'An acute angle is an angle that measures less than 90 degrees.'),
        createSampleQuestion('q_geo_4', 'What is the name of a shape with 4 equal sides and 4 right angles?', ['Rectangle', 'Rhombus', 'Square', 'Trapezoid'], 2, 'A square is a regular quadrilateral, which means that it has four equal sides and four equal angles (90-degree angles, or right angles).'),
        createSampleQuestion('q_geo_5', 'The distance around a circle is called its...?', ['Radius', 'Diameter', 'Area', 'Circumference'], 3, 'The circumference is the distance around the edge of a circle (or any curvy shape).'),
      ]
    },
  ],
  announcements: [
    { id: 'an1', date: getTodayDateString(), message: 'Welcome to StudyQuest! New materials are posted daily.', publishedAt: Date.now() - 3600000 },
    { id: 'an2', date: '2024-07-20', message: 'Mid-term review session next week.', publishedAt: Date.now() - 86400000 },
  ],
};

// Simulate API calls
export const getLearningMaterialByDate = async (date: string): Promise<LearningMaterial | undefined> => {
  return mockContent.learningMaterials.find(material => material.date === date);
};

export const getQuizByDate = async (date: string): Promise<Quiz | undefined> => {
  return mockContent.quizzes.find(quiz => quiz.date === date);
};

export const getAnnouncements = async (limit: number = 5): Promise<Announcement[]> => {
  return [...mockContent.announcements].sort((a,b) => b.publishedAt - a.publishedAt).slice(0, limit);
};

// Admin functions to modify mock data
export const addLearningMaterial = async (material: Omit<LearningMaterial, 'id'>): Promise<LearningMaterial> => {
  const newMaterial: LearningMaterial = { ...material, id: `lm${Date.now()}` };
  mockContent.learningMaterials.push(newMaterial);
  return newMaterial;
};

export const updateLearningMaterial = async (updatedMaterial: LearningMaterial): Promise<LearningMaterial | undefined> => {
  const index = mockContent.learningMaterials.findIndex(m => m.id === updatedMaterial.id);
  if (index !== -1) {
    mockContent.learningMaterials[index] = updatedMaterial;
    return updatedMaterial;
  }
  return undefined;
};

export const addQuiz = async (quiz: Omit<Quiz, 'id'>): Promise<Quiz> => {
  const newQuiz: Quiz = { ...quiz, id: `quiz${Date.now()}` };
  mockContent.quizzes.push(newQuiz);
  return newQuiz;
};

export const updateQuiz = async (updatedQuiz: Quiz): Promise<Quiz | undefined> => {
  const index = mockContent.quizzes.findIndex(q => q.id === updatedQuiz.id);
  if (index !== -1) {
    mockContent.quizzes[index] = updatedQuiz;
    return updatedQuiz;
  }
  return undefined;
};

export const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'publishedAt'>): Promise<Announcement> => {
  const newAnnouncement: Announcement = { ...announcement, id: `an${Date.now()}`, publishedAt: Date.now() };
  mockContent.announcements.unshift(newAnnouncement); // Add to the beginning
  return newAnnouncement;
};

// For Webhook updates - this is a simplified version
export const updateDailyContentViaWebhook = async (data: { date: string, material?: Partial<LearningMaterial>, quiz?: Partial<Quiz> }): Promise<boolean> => {
  const { date, material, quiz } = data;
  let materialUpdated = false;
  let quizUpdated = false;

  if (material) {
    let existingMaterial = mockContent.learningMaterials.find(m => m.date === date);
    if (existingMaterial) {
      Object.assign(existingMaterial, material);
    } else {
      mockContent.learningMaterials.push({ id: `lm-wh-${Date.now()}`, date, title: 'New Material', content: 'Webhook content', ...material });
    }
    materialUpdated = true;
  }

  if (quiz) {
    let existingQuiz = mockContent.quizzes.find(q => q.date === date);
    if (existingQuiz) {
      Object.assign(existingQuiz, quiz);
    } else {
      mockContent.quizzes.push({ id: `quiz-wh-${Date.now()}`, date, title: 'New Quiz', questions: [], ...quiz });
    }
    quizUpdated = true;
  }
  console.log("Webhook processed. Mock data updated:", mockContent);
  return materialUpdated || quizUpdated;
};

export const getAllLearningMaterials = async (): Promise<LearningMaterial[]> => {
  return [...mockContent.learningMaterials];
}

export const getAllQuizzes = async (): Promise<Quiz[]> => {
  return [...mockContent.quizzes];
}

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  return [...mockContent.announcements];
}

