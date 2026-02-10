import { Router } from 'express';
import { getDb } from '../db/connection';

export const analyticsRoutes = Router();

// Dashboard metrics
analyticsRoutes.get('/dashboard', (_req, res) => {
  const db = getDb();

  const totalTalents = (db.prepare('SELECT COUNT(*) as c FROM talents').get() as any).c;

  // By stage
  const stageRows = db.prepare('SELECT funnel_stage, COUNT(*) as c FROM talents GROUP BY funnel_stage').all() as any[];
  const talentsByStage: Record<string, number> = {};
  for (const r of stageRows) talentsByStage[r.funnel_stage] = r.c;

  // By level
  const levelRows = db.prepare('SELECT experience_level, COUNT(*) as c FROM talents GROUP BY experience_level').all() as any[];
  const talentsByLevel: Record<string, number> = {};
  for (const r of levelRows) talentsByLevel[r.experience_level] = r.c;

  // By source
  const sourceRows = db.prepare('SELECT source, COUNT(*) as c FROM talents GROUP BY source').all() as any[];
  const talentsBySource: Record<string, number> = {};
  for (const r of sourceRows) talentsBySource[r.source] = r.c;

  // Outreach metrics
  const outreachTotal = (db.prepare('SELECT COUNT(*) as c FROM outreach_history').get() as any).c;
  const outreachResponded = (db.prepare('SELECT COUNT(*) as c FROM outreach_history WHERE responded_at IS NOT NULL').get() as any).c;

  // Campaign performance
  const activeCampaigns = (db.prepare('SELECT COUNT(*) as c FROM campaigns WHERE status = "active"').get() as any).c;
  const bestCampaign = db.prepare('SELECT name FROM campaigns WHERE status = "active" ORDER BY responded DESC LIMIT 1').get() as any;
  const worstCampaign = db.prepare('SELECT name FROM campaigns WHERE status = "active" ORDER BY responded ASC LIMIT 1').get() as any;

  // Gamification
  const activePlayers = (db.prepare('SELECT COUNT(*) as c FROM talents WHERE points > 0').get() as any).c;
  const challengesCompleted = (db.prepare('SELECT SUM(completions) as c FROM challenges').get() as any).c || 0;
  const avgEngagement = (db.prepare('SELECT AVG(engagement_score) as avg FROM talents').get() as any).avg || 0;

  // By location (state)
  const locationRows = db.prepare('SELECT state, COUNT(*) as c FROM talents WHERE state IS NOT NULL GROUP BY state ORDER BY c DESC').all() as any[];
  const talentsByLocation: Record<string, number> = {};
  for (const r of locationRows) talentsByLocation[r.state] = r.c;

  // By consent
  const consentRows = db.prepare('SELECT consent_status, COUNT(*) as c FROM talents GROUP BY consent_status').all() as any[];
  const talentsByConsent: Record<string, number> = {};
  for (const r of consentRows) talentsByConsent[r.consent_status] = r.c;

  // Simulated weekly trend
  const weeklyTrend = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - i * 7);
    weeklyTrend.push({
      week: weekDate.toISOString().split('T')[0],
      discovered: Math.floor(20 + Math.random() * 30),
      contacted: Math.floor(15 + Math.random() * 20),
      responded: Math.floor(3 + Math.random() * 10),
      hired: Math.floor(Math.random() * 3),
    });
  }

  res.json({
    success: true,
    data: {
      totalTalents,
      talentsByStage,
      talentsByLevel,
      talentsBySource,
      talentsByLocation,
      talentsByConsent,
      outreachMetrics: {
        totalSent: outreachTotal,
        responseRate: outreachTotal > 0 ? (outreachResponded / outreachTotal) * 100 : 0,
        engagementRate: avgEngagement,
        avgTimeToRespond: 48,
      },
      campaignPerformance: {
        activeCampaigns,
        bestPerforming: bestCampaign?.name || 'N/A',
        worstPerforming: worstCampaign?.name || 'N/A',
      },
      gamificationMetrics: {
        activePlayers,
        challengesCompleted,
        avgEngagementScore: Math.round(avgEngagement),
      },
      weeklyTrend,
    },
  });
});

// Funnel analysis
analyticsRoutes.get('/funnel', (_req, res) => {
  const db = getDb();
  const stages = ['discovered', 'enriched', 'outreach_ready', 'contacted', 'engaged', 'responded', 'screening', 'interviewing', 'offer', 'hired'];

  const funnel = stages.map(stage => {
    const count = (db.prepare('SELECT COUNT(*) as c FROM talents WHERE funnel_stage = ?').get(stage) as any).c;
    return { stage, count };
  });

  res.json({ success: true, data: funnel });
});

// Source effectiveness
analyticsRoutes.get('/source-effectiveness', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT source,
      COUNT(*) as total,
      AVG(engagement_score) as avg_engagement,
      SUM(CASE WHEN funnel_stage IN ('responded','screening','interviewing','offer','hired') THEN 1 ELSE 0 END) as advanced,
      SUM(CASE WHEN funnel_stage = 'hired' THEN 1 ELSE 0 END) as hired
    FROM talents
    GROUP BY source
    ORDER BY avg_engagement DESC
  `).all();

  res.json({ success: true, data: rows });
});

// Experience level breakdown
analyticsRoutes.get('/level-breakdown', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT experience_level,
      COUNT(*) as total,
      AVG(engagement_score) as avg_engagement,
      AVG(points) as avg_points,
      SUM(CASE WHEN funnel_stage IN ('responded','screening','interviewing','offer','hired') THEN 1 ELSE 0 END) as advanced
    FROM talents
    GROUP BY experience_level
  `).all();

  res.json({ success: true, data: rows });
});
