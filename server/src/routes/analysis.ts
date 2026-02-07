import { Router } from 'express';

const router = Router();

// Analysis is handled in projects (create + brainstorm).
// This route can be used for health or future analysis-only endpoints.
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'analysis' });
});

export default router;
