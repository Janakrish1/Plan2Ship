import './env.js';
import express from 'express';
import cors from 'cors';
import { ensureDirectories } from './utils/fileStorage.js';
import projectsRouter from './routes/projects.js';
import analysisRouter from './routes/analysis.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/projects', projectsRouter);
app.use('/api/analysis', analysisRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  await ensureDirectories();
  app.listen(PORT, () => {
    console.log(`Plan2Ship server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
