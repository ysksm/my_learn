import express from 'express';
import { Post, ApiResponse } from '../types';

export const postRoutes = express.Router();

const mockPosts: Post[] = [
  { id: 1, title: 'First Post', content: 'This is the first post content.', authorId: 1, createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Second Post', content: 'This is the second post content.', authorId: 2, createdAt: '2024-01-02T00:00:00Z' },
  { id: 3, title: 'Third Post', content: 'This is the third post content.', authorId: 1, createdAt: '2024-01-03T00:00:00Z' },
];

// GET /api/posts - 全投稿取得
postRoutes.get('/', (req, res) => {
  const response: ApiResponse<Post[]> = {
    success: true,
    data: mockPosts,
    timestamp: new Date().toISOString()
  };
  res.json(response);
});

// GET /api/posts/:id - 特定投稿取得
postRoutes.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const post = mockPosts.find(p => p.id === id);

  if (!post) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Post not found',
      timestamp: new Date().toISOString()
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Post> = {
    success: true,
    data: post,
    timestamp: new Date().toISOString()
  };
  res.json(response);
});

// GET /api/posts/author/:authorId - 特定作者の投稿取得
postRoutes.get('/author/:authorId', (req, res) => {
  const authorId = parseInt(req.params.authorId);
  const posts = mockPosts.filter(p => p.authorId === authorId);

  const response: ApiResponse<Post[]> = {
    success: true,
    data: posts,
    timestamp: new Date().toISOString()
  };
  res.json(response);
});