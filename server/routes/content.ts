import { Router } from 'express';
import { getDb } from '../db/connection';
import { nanoid } from 'nanoid';

export const contentRoutes = Router();

contentRoutes.get('/', (req, res) => {
  const db = getDb();
  const { type, source, experienceLevel, sapModule, accentureOnly } = req.query;
  let sql = 'SELECT * FROM content_pieces';
  const conditions: string[] = [];
  const params: any[] = [];

  if (type) { conditions.push('type = ?'); params.push(type); }
  if (source) { conditions.push('source = ?'); params.push(source); }
  if (experienceLevel) { conditions.push('(experience_level = ? OR experience_level = "all")'); params.push(experienceLevel); }
  if (sapModule) { conditions.push('sap_modules LIKE ?'); params.push(`%${sapModule}%`); }
  if (accentureOnly === 'true') { conditions.push('is_accenture_asset = 1'); }

  if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
  sql += ' ORDER BY engagement_count DESC';

  const rows = db.prepare(sql).all(...params);
  res.json({
    success: true,
    data: rows.map((r: any) => ({
      ...r,
      sapModules: JSON.parse(r.sap_modules || '[]'),
      tags: JSON.parse(r.tags || '[]'),
      experienceLevel: r.experience_level,
      isAccentureAsset: Boolean(r.is_accenture_asset),
      engagementCount: r.engagement_count,
      publishedAt: r.published_at,
      createdAt: r.created_at,
    })),
  });
});

contentRoutes.post('/', (req, res) => {
  const db = getDb();
  const id = nanoid();
  const c = req.body;

  db.prepare(`INSERT INTO content_pieces (id, title, type, source, url, summary, sap_modules, experience_level, tags, is_accenture_asset, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, c.title, c.type || 'article', c.source || 'manual', c.url || null,
    c.summary || '', JSON.stringify(c.sapModules || []), c.experienceLevel || 'all',
    JSON.stringify(c.tags || []), c.isAccentureAsset ? 1 : 0, c.publishedAt || null
  );

  const row = db.prepare('SELECT * FROM content_pieces WHERE id = ?').get(id) as any;
  res.status(201).json({ success: true, data: row });
});

// Recommend content for a talent
contentRoutes.get('/recommend/:talentId', (req, res) => {
  const db = getDb();
  const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.talentId) as any;
  if (!talent) return res.status(404).json({ success: false, error: 'Talent not found' });

  const sapModules = JSON.parse(talent.sap_modules || '[]');
  let query = `SELECT * FROM content_pieces WHERE (experience_level = ? OR experience_level = 'all')`;
  const params: any[] = [talent.experience_level];

  if (sapModules.length > 0) {
    query += ` AND (${sapModules.map(() => 'sap_modules LIKE ?').join(' OR ')})`;
    params.push(...sapModules.map((m: string) => `%${m}%`));
  }

  query += ' ORDER BY is_accenture_asset DESC, engagement_count DESC LIMIT 5';

  const rows = db.prepare(query).all(...params);
  res.json({
    success: true,
    data: rows.map((r: any) => ({
      ...r,
      sapModules: JSON.parse(r.sap_modules || '[]'),
      tags: JSON.parse(r.tags || '[]'),
      isAccentureAsset: Boolean(r.is_accenture_asset),
    })),
  });
});
