export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PollData {
  id: string;
  value: number;
  status: 'active' | 'inactive';
  lastUpdated: string;
}