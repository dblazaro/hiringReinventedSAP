import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { getDb } from './db/connection';
import { SCHEMA } from './db/schema';
import { talentRoutes } from './routes/talents';
import { campaignRoutes } from './routes/campaigns';
import { templateRoutes } from './routes/templates';
import { outreachRoutes } from './routes/outreach';
import { gamificationRoutes } from './routes/gamification';
import { contentRoutes } from './routes/content';
import { analyticsRoutes } from './routes/analytics';
import { lgpdRoutes } from './routes/lgpd';
import { sourcingRoutes } from './routes/sourcing';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Initialize database
const db = getDb();
db.exec(SCHEMA);

// API Routes
app.use('/api/talents', talentRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/outreach', outreachRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/lgpd', lgpdRoutes);
app.use('/api/sourcing', sourcingRoutes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client');
  app.use(express.static(clientPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║         TalentFlow SAP - Server Running                  ║
║         http://localhost:${PORT}                            ║
║                                                          ║
║  Accenture Talent Intelligence Platform                  ║
║  SAP Professional Hiring - Brazil                        ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
