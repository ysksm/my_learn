import express from 'express';
import { User, ApiResponse } from '../types';

export const userRoutes = express.Router();

const mockUsers: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', createdAt: '2024-01-02T00:00:00Z' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', createdAt: '2024-01-03T00:00:00Z' },
];

// GET /api/users - 全ユーザー取得
userRoutes.get('/', (req, res) => {
  const response: ApiResponse<User[]> = {
    success: true,
    data: mockUsers,
    timestamp: new Date().toISOString()
  };
  res.json(response);
});

// GET /api/users/:id - 特定ユーザー取得
userRoutes.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = mockUsers.find(u => u.id === id);

  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'User not found',
      timestamp: new Date().toISOString()
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<User> = {
    success: true,
    data: user,
    timestamp: new Date().toISOString()
  };
  res.json(response);
});

// POST /api/users - ユーザー作成
userRoutes.post('/', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Name and email are required',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  const newUser: User = {
    id: Math.max(...mockUsers.map(u => u.id)) + 1,
    name,
    email,
    createdAt: new Date().toISOString()
  };

  mockUsers.push(newUser);

  const response: ApiResponse<User> = {
    success: true,
    data: newUser,
    timestamp: new Date().toISOString()
  };
  res.status(201).json(response);
});