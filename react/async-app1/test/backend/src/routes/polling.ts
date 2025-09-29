import express from 'express';
import { PollData, ApiResponse } from '../types';

export const pollRoutes = express.Router();

let pollData: PollData = {
  id: 'poll-1',
  value: 0,
  status: 'active',
  lastUpdated: new Date().toISOString()
};

// GET /api/poll/data - ポーリング用データ取得
pollRoutes.get('/data', (req, res) => {
  // データを定期的に変更（実際のポーリングをシミュレート）
  pollData.value = Math.floor(Math.random() * 100);
  pollData.lastUpdated = new Date().toISOString();

  const response: ApiResponse<PollData> = {
    success: true,
    data: pollData,
    timestamp: new Date().toISOString()
  };

  res.json(response);
});

// POST /api/poll/toggle - ポーリング状態切り替え
pollRoutes.post('/toggle', (req, res) => {
  pollData.status = pollData.status === 'active' ? 'inactive' : 'active';
  pollData.lastUpdated = new Date().toISOString();

  const response: ApiResponse<PollData> = {
    success: true,
    data: pollData,
    timestamp: new Date().toISOString()
  };

  res.json(response);
});

// GET /api/poll/stream - Server-Sent Events用エンドポイント（将来の拡張用）
pollRoutes.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const sendData = () => {
    if (pollData.status === 'active') {
      pollData.value = Math.floor(Math.random() * 100);
      pollData.lastUpdated = new Date().toISOString();
      res.write(`data: ${JSON.stringify(pollData)}\n\n`);
    }
  };

  const interval = setInterval(sendData, 2000);

  req.on('close', () => {
    clearInterval(interval);
  });
});