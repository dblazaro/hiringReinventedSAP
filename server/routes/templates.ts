import { Router } from 'express';
import { getDb } from '../db/connection';
import { nanoid } from 'nanoid';

export const templateRoutes = Router();

templateRoutes.get('/', (req, res) => {
  const db = getDb();
  const { channel, experienceLevel, category } = req.query;
  let sql = 'SELECT * FROM message_templates';
  const conditions: string[] = [];
  const params: any[] = [];

  if (channel) { conditions.push('channel = ?'); params.push(channel); }
  if (experienceLevel) { conditions.push('(experience_level = ? OR experience_level = "all")'); params.push(experienceLevel); }
  if (category) { conditions.push('category = ?'); params.push(category); }

  if (conditions.length > 0) sql += ` WHERE ${conditions.join(' AND ')}`;
  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows.map(parseTemplateRow) });
});

templateRoutes.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM message_templates WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Template not found' });
  res.json({ success: true, data: parseTemplateRow(row) });
});

templateRoutes.post('/', (req, res) => {
  const db = getDb();
  const id = nanoid();
  const t = req.body;

  db.prepare(`INSERT INTO message_templates (id, name, channel, subject, body, variables, experience_level, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, t.name, t.channel || 'email', t.subject || null, t.body,
    JSON.stringify(t.variables || []), t.experienceLevel || 'all', t.category || 'initial_outreach'
  );

  const row = db.prepare('SELECT * FROM message_templates WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: parseTemplateRow(row) });
});

templateRoutes.put('/:id', (req, res) => {
  const db = getDb();
  const t = req.body;
  const fields: string[] = [];
  const values: any[] = [];

  if (t.name !== undefined) { fields.push('name = ?'); values.push(t.name); }
  if (t.channel !== undefined) { fields.push('channel = ?'); values.push(t.channel); }
  if (t.subject !== undefined) { fields.push('subject = ?'); values.push(t.subject); }
  if (t.body !== undefined) { fields.push('body = ?'); values.push(t.body); }
  if (t.variables !== undefined) { fields.push('variables = ?'); values.push(JSON.stringify(t.variables)); }
  if (t.experienceLevel !== undefined) { fields.push('experience_level = ?'); values.push(t.experienceLevel); }
  if (t.category !== undefined) { fields.push('category = ?'); values.push(t.category); }

  if (fields.length > 0) {
    fields.push('updated_at = datetime("now")');
    values.push(req.params.id);
    db.prepare(`UPDATE message_templates SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  const row = db.prepare('SELECT * FROM message_templates WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Template not found' });
  res.json({ success: true, data: parseTemplateRow(row) });
});

function parseTemplateRow(row: any): any {
  if (!row) return null;
  return {
    ...row,
    variables: JSON.parse(row.variables || '[]'),
    experienceLevel: row.experience_level,
    timesSent: row.times_sent,
    responseRate: row.response_rate,
    engagementRate: row.engagement_rate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
