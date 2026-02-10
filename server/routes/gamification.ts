import { Router } from 'express';
import { getDb } from '../db/connection';
import { nanoid } from 'nanoid';

export const gamificationRoutes = Router();

// Get all challenges
gamificationRoutes.get('/challenges', (req, res) => {
  const db = getDb();
  const { difficulty, sapModule, active } = req.query;
  let sql = 'SELECT * FROM challenges';
  const conditions: string[] = [];
  const params: any[] = [];

  if (difficulty) { conditions.push('difficulty = ?'); params.push(difficulty); }
  if (sapModule) { conditions.push('sap_module LIKE ?'); params.push(`%${sapModule}%`); }
  if (active !== undefined) { conditions.push('is_active = ?'); params.push(active === 'true' ? 1 : 0); }

  if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows.map(parseChallengeRow) });
});

// Get single challenge
gamificationRoutes.get('/challenges/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM challenges WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Challenge not found' });
  res.json({ success: true, data: parseChallengeRow(row) });
});

// Submit challenge completion
gamificationRoutes.post('/challenges/:id/submit', (req, res) => {
  const db = getDb();
  const { talentId, answers, score } = req.body;

  const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(req.params.id) as any;
  if (!challenge) return res.status(404).json({ success: false, error: 'Challenge not found' });

  const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(talentId) as any;
  if (!talent) return res.status(404).json({ success: false, error: 'Talent not found' });

  // Calculate points earned
  const pointsEarned = Math.floor(challenge.points * (score / 100));

  // Update talent
  const completed = JSON.parse(talent.challenges_completed || '[]');
  completed.push(req.params.id);
  const badges = JSON.parse(talent.badges_earned || '[]');
  if (challenge.badge_id && score >= 80) {
    badges.push(challenge.badge_id);
  }

  db.prepare(`UPDATE talents SET
    challenges_completed = ?, badges_earned = ?,
    points = points + ?, engagement_score = MIN(100, engagement_score + ?),
    funnel_stage = CASE WHEN funnel_stage IN ('discovered','enriched','outreach_ready','contacted') THEN 'engaged' ELSE funnel_stage END,
    updated_at = datetime('now')
    WHERE id = ?`).run(
    JSON.stringify(completed), JSON.stringify(badges),
    pointsEarned, Math.floor(pointsEarned / 10),
    talentId
  );

  // Update challenge stats
  const newCompletions = challenge.completions + 1;
  const newAvg = ((challenge.avg_score * challenge.completions) + score) / newCompletions;
  db.prepare('UPDATE challenges SET completions = ?, avg_score = ? WHERE id = ?').run(newCompletions, newAvg, req.params.id);

  // Log activity
  db.prepare('INSERT INTO talent_activity (id, talent_id, activity_type, details, points_earned) VALUES (?, ?, ?, ?, ?)').run(
    nanoid(), talentId, 'challenge_completed',
    JSON.stringify({ challengeId: req.params.id, score, answers }),
    pointsEarned
  );

  res.json({
    success: true,
    data: {
      pointsEarned,
      totalPoints: talent.points + pointsEarned,
      badgeEarned: challenge.badge_id && score >= 80 ? challenge.badge_id : null,
      score,
    },
  });
});

// Get all badges
gamificationRoutes.get('/badges', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM badges').all();
  res.json({ success: true, data: rows });
});

// Get leaderboard
gamificationRoutes.get('/leaderboard', (req, res) => {
  const db = getDb();
  const { limit = '20' } = req.query;

  const rows = db.prepare(`
    SELECT id, full_name, points, badges_earned, challenges_completed, engagement_score
    FROM talents
    WHERE points > 0
    ORDER BY points DESC
    LIMIT ?
  `).all(parseInt(limit as string));

  const leaderboard = rows.map((row: any, index: number) => ({
    rank: index + 1,
    talentId: row.id,
    talentName: row.full_name,
    points: row.points,
    badgeCount: JSON.parse(row.badges_earned || '[]').length,
    challengesCompleted: JSON.parse(row.challenges_completed || '[]').length,
    engagementScore: row.engagement_score,
  }));

  res.json({ success: true, data: leaderboard });
});

// Get talent's gamification profile
gamificationRoutes.get('/profile/:talentId', (req, res) => {
  const db = getDb();
  const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.talentId) as any;
  if (!talent) return res.status(404).json({ success: false, error: 'Talent not found' });

  const badgeIds = JSON.parse(talent.badges_earned || '[]');
  const badges = badgeIds.length > 0
    ? db.prepare(`SELECT * FROM badges WHERE id IN (${badgeIds.map(() => '?').join(',')})`).all(...badgeIds)
    : [];

  const challengeIds = JSON.parse(talent.challenges_completed || '[]');
  const challenges = challengeIds.length > 0
    ? db.prepare(`SELECT id, title, difficulty, points FROM challenges WHERE id IN (${challengeIds.map(() => '?').join(',')})`).all(...challengeIds)
    : [];

  const activities = db.prepare('SELECT * FROM talent_activity WHERE talent_id = ? ORDER BY created_at DESC LIMIT 20').all(req.params.talentId);

  // Calculate rank
  const rankRow = db.prepare('SELECT COUNT(*) as rank FROM talents WHERE points > (SELECT points FROM talents WHERE id = ?)').get(req.params.talentId) as any;

  res.json({
    success: true,
    data: {
      points: talent.points,
      rank: (rankRow?.rank || 0) + 1,
      badges,
      challengesCompleted: challenges,
      recentActivity: activities,
      engagementScore: talent.engagement_score,
      profileCompleteness: talent.profile_completeness,
    },
  });
});

function parseChallengeRow(row: any): any {
  if (!row) return null;
  return {
    ...row,
    content: JSON.parse(row.content || '{}'),
    sapModule: row.sap_module,
    badgeId: row.badge_id,
    timeLimit: row.time_limit,
    isActive: Boolean(row.is_active),
    avgScore: row.avg_score,
    createdAt: row.created_at,
  };
}
