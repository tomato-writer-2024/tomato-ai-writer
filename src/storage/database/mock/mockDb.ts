/**
 * Mock数据库层
 * 在Mock模式下模拟数据库操作
 */

import fs from 'fs/promises';
import path from 'path';

export interface MockUser {
  id: string;
  username: string;
  email: string;
  password: string;
  passwordHash: string;
  role: string;
  membershipLevel: string;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  membershipExpireAt?: string;
  dailyUsageCount?: number;
  monthlyUsageCount?: number;
  storageUsed?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockNovel {
  id: string;
  userId: string;
  title: string;
  description: string;
  genre: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockChapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Mock数据存储
const MOCK_DATA_DIR = path.join(process.cwd(), '.mock-data');

let mockUsers: MockUser[] = [];
let mockNovels: MockNovel[] = [];
let mockChapters: MockChapter[] = [];

/**
 * 初始化Mock数据库
 */
export async function initMockDb(): Promise<void> {
  try {
    // 确保目录存在
    await fs.mkdir(MOCK_DATA_DIR, { recursive: true });

    // 加载用户数据
    const usersPath = path.join(MOCK_DATA_DIR, 'users.json');
    try {
      const usersData = await fs.readFile(usersPath, 'utf-8');
      mockUsers = JSON.parse(usersData);
      console.log(`Mock数据库: 加载了 ${mockUsers.length} 个用户`);
    } catch (error) {
      // 文件不存在，创建空数组
      mockUsers = [];
      await fs.writeFile(usersPath, JSON.stringify(mockUsers, null, 2));
      console.log('Mock数据库: 创建用户数据文件');
    }

    // 加载小说数据
    const novelsPath = path.join(MOCK_DATA_DIR, 'novels.json');
    try {
      const novelsData = await fs.readFile(novelsPath, 'utf-8');
      mockNovels = JSON.parse(novelsData);
      console.log(`Mock数据库: 加载了 ${mockNovels.length} 个小说`);
    } catch (error) {
      mockNovels = [];
      await fs.writeFile(novelsPath, JSON.stringify(mockNovels, null, 2));
      console.log('Mock数据库: 创建小说数据文件');
    }

    // 加载章节数据
    const chaptersPath = path.join(MOCK_DATA_DIR, 'chapters.json');
    try {
      const chaptersData = await fs.readFile(chaptersPath, 'utf-8');
      mockChapters = JSON.parse(chaptersData);
      console.log(`Mock数据库: 加载了 ${mockChapters.length} 个章节`);
    } catch (error) {
      mockChapters = [];
      await fs.writeFile(chaptersPath, JSON.stringify(mockChapters, null, 2));
      console.log('Mock数据库: 创建章节数据文件');
    }
  } catch (error) {
    console.error('Mock数据库初始化失败:', error);
  }
}

/**
 * 保存Mock数据到文件
 */
export async function saveMockData(): Promise<void> {
  try {
    await fs.writeFile(
      path.join(MOCK_DATA_DIR, 'users.json'),
      JSON.stringify(mockUsers, null, 2)
    );
    await fs.writeFile(
      path.join(MOCK_DATA_DIR, 'novels.json'),
      JSON.stringify(mockNovels, null, 2)
    );
    await fs.writeFile(
      path.join(MOCK_DATA_DIR, 'chapters.json'),
      JSON.stringify(mockChapters, null, 2)
    );
  } catch (error) {
    console.error('保存Mock数据失败:', error);
  }
}

// Mock操作函数
export const mockDb = {
  // 用户操作
  users: {
    find: (filters: Partial<MockUser>): MockUser[] => {
      return mockUsers.filter(user => {
        return Object.entries(filters).every(([key, value]) => user[key as keyof MockUser] === value);
      });
    },
    insert: (user: MockUser): MockUser => {
      mockUsers.push(user);
      saveMockData();
      return user;
    },
    update: (id: string, updates: Partial<MockUser>): MockUser | null => {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) return null;
      mockUsers[index] = { ...mockUsers[index], ...updates, updatedAt: new Date().toISOString() };
      saveMockData();
      return mockUsers[index];
    },
    delete: (id: string): boolean => {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) return false;
      mockUsers.splice(index, 1);
      saveMockData();
      return true;
    }
  },
  // 小说操作
  novels: {
    find: (filters: Partial<MockNovel>): MockNovel[] => {
      return mockNovels.filter(novel => {
        return Object.entries(filters).every(([key, value]) => novel[key as keyof MockNovel] === value);
      });
    },
    insert: (novel: MockNovel): MockNovel => {
      mockNovels.push(novel);
      saveMockData();
      return novel;
    },
    update: (id: string, updates: Partial<MockNovel>): MockNovel | null => {
      const index = mockNovels.findIndex(n => n.id === id);
      if (index === -1) return null;
      mockNovels[index] = { ...mockNovels[index], ...updates, updatedAt: new Date().toISOString() };
      saveMockData();
      return mockNovels[index];
    },
    delete: (id: string): boolean => {
      const index = mockNovels.findIndex(n => n.id === id);
      if (index === -1) return false;
      mockNovels.splice(index, 1);
      saveMockData();
      return true;
    }
  },
  // 章节操作
  chapters: {
    find: (filters: Partial<MockChapter>): MockChapter[] => {
      return mockChapters.filter(chapter => {
        return Object.entries(filters).every(([key, value]) => chapter[key as keyof MockChapter] === value);
      });
    },
    insert: (chapter: MockChapter): MockChapter => {
      mockChapters.push(chapter);
      saveMockData();
      return chapter;
    },
    update: (id: string, updates: Partial<MockChapter>): MockChapter | null => {
      const index = mockChapters.findIndex(c => c.id === id);
      if (index === -1) return null;
      mockChapters[index] = { ...mockChapters[index], ...updates, updatedAt: new Date().toISOString() };
      saveMockData();
      return mockChapters[index];
    },
    delete: (id: string): boolean => {
      const index = mockChapters.findIndex(c => c.id === id);
      if (index === -1) return false;
      mockChapters.splice(index, 1);
      saveMockData();
      return true;
    }
  }
};
