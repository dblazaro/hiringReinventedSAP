import { Router } from 'express';
import { getDb } from '../db/connection';
import { nanoid } from 'nanoid';

export const campaignRoutes = Router();

campaignRoutes.get('/', (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
  res.json({ success: true, data: rows.map(parseCampaignRow) });
});

campaignRoutes.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Campaign not found' });
  res.json({ success: true, data: parseCampaignRow(row) });
});

campaignRoutes.post('/', (req, res) => {
  const db = getDb();
  const id = nanoid();
  const c = req.body;

  db.prepare(`INSERT INTO campaigns (id, name, description, status, target_experience_levels, target_sap_modules, target_locations, channel, steps, accenture_assets)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, c.name, c.description || '', c.status || 'draft',
    JSON.stringify(c.targetExperienceLevels || []),
    JSON.stringify(c.targetSapModules || []),
    JSON.stringify(c.targetLocations || []),
    c.channel || 'email',
    JSON.stringify(c.steps || []),
    JSON.stringify(c.accentureAssets || [])
  );

  const row = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: parseCampaignRow(row) });
});

campaignRoutes.put('/:id', (req, res) => {
  const db = getDb();
  const c = req.body;
  const fields: string[] = [];
  const values: any[] = [];

  if (c.name !== undefined) { fields.push('name = ?'); values.push(c.name); }
  if (c.description !== undefined) { fields.push('description = ?'); values.push(c.description); }
  if (c.status !== undefined) { fields.push('status = ?'); values.push(c.status); }
  if (c.channel !== undefined) { fields.push('channel = ?'); values.push(c.channel); }
  if (c.targetExperienceLevels !== undefined) { fields.push('target_experience_levels = ?'); values.push(JSON.stringify(c.targetExperienceLevels)); }
  if (c.targetSapModules !== undefined) { fields.push('target_sap_modules = ?'); values.push(JSON.stringify(c.targetSapModules)); }
  if (c.targetLocations !== undefined) { fields.push('target_locations = ?'); values.push(JSON.stringify(c.targetLocations)); }
  if (c.steps !== undefined) { fields.push('steps = ?'); values.push(JSON.stringify(c.steps)); }
  if (c.accentureAssets !== undefined) { fields.push('accenture_assets = ?'); values.push(JSON.stringify(c.accentureAssets)); }

  if (fields.length > 0) {
    fields.push('updated_at = datetime("now")');
    values.push(req.params.id);
    db.prepare(`UPDATE campaigns SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  const row = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Campaign not found' });
  res.json({ success: true, data: parseCampaignRow(row) });
});

campaignRoutes.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM campaigns WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ success: false, error: 'Campaign not found' });
  res.json({ success: true });
});

function parseCampaignRow(row: any): any {
  if (!row) return null;
  return {
    ...row,
    targetExperienceLevels: JSON.parse(row.target_experience_levels || '[]'),
    targetSapModules: JSON.parse(row.target_sap_modules || '[]'),
    targetLocations: JSON.parse(row.target_locations || '[]'),
    steps: JSON.parse(row.steps || '[]'),
    accentureAssets: JSON.parse(row.accenture_assets || '[]'),
    totalTargets: row.total_targets,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
