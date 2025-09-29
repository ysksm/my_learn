import express from 'express';
import { ApiResponse } from '../types';

export const timeoutRoutes = express.Router();

// GET /api/timeout/slow/:delay - 指定された遅延後にレスポンス
timeoutRoutes.get('/slow/:delay', (req, res) => {
  const delay = parseInt(req.params.delay) || 1000;
  const maxDelay = 30000; // 最大30秒

  if (delay > maxDelay) {
    const response: ApiResponse<null> = {
      success: false,
      error: `Delay cannot exceed ${maxDelay}ms`,
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  setTimeout(() => {
    const response: ApiResponse<{delay: number, processedAt: string}> = {
      success: true,
      data: {
        delay,
        processedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
    res.json(response);
  }, delay);
});

// GET /api/timeout/random - ランダムな遅延でレスポンス
timeoutRoutes.get('/random', (req, res) => {
  const delay = Math.floor(Math.random() * 5000) + 500; // 500ms〜5500ms

  setTimeout(() => {
    const response: ApiResponse<{delay: number, processedAt: string}> = {
      success: true,
      data: {
        delay,
        processedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
    res.json(response);
  }, delay);
});

// GET /api/timeout/error/:errorRate - 指定確率でエラーを返す
timeoutRoutes.get('/error/:errorRate', (req, res) => {
  const errorRate = parseInt(req.params.errorRate) || 50; // デフォルト50%
  const shouldError = Math.random() * 100 < errorRate;

  const delay = Math.floor(Math.random() * 2000) + 500; // 500ms〜2500ms

  setTimeout(() => {
    if (shouldError) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Simulated server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    } else {
      const response: ApiResponse<{errorRate: number, processedAt: string}> = {
        success: true,
        data: {
          errorRate,
          processedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
      res.json(response);
    }
  }, delay);
});