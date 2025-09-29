import express from 'express';
import cors from 'cors';
import { userRoutes } from './routes/users';
import { postRoutes } from './routes/posts';
import { pollRoutes } from './routes/polling';
import { timeoutRoutes } from './routes/timeout';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/timeout', timeoutRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});