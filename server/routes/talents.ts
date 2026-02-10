import { Router } from 'express';
import { getDb } from '../db/connection';
import { nanoid } from 'nanoid';

export const talentRoutes = Router();

// GET /api/talents - List with filtering, search, pagination
talentRoutes.get('/', (req, res) => {
  const db = getDb();
  const {
    search, experienceLevel, sapModules, funnelStage, source,
    location, minEngagementScore, tags, consentStatus,
    page = '1', pageSize = '20', sortBy = 'created_at', sortOrder = 'desc'
  } = req.query;

  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push('(full_name LIKE ? OR email LIKE ? OR current_company LIKE ? OR current_role LIKE ? OR sap_modules LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }
  if (experienceLevel) {
    const levels = (experienceLevel as string).split(',');
    conditions.push(`experience_level IN (${levels.map(() => '?').join(',')})`);
    params.push(...levels);
  }
  if (sapModules) {
    const mods = (sapModules as string).split(',');
    const modConditions = mods.map(() => 'sap_modules LIKE ?');
    conditions.push(`(${modConditions.join(' OR ')})`);
    params.push(...mods.map(m => `%${m}%`));
  }
  if (funnelStage) {
    const stages = (funnelStage as string).split(',');
    conditions.push(`funnel_stage IN (${stages.map(() => '?').join(',')})`);
    params.push(...stages);
  }
  if (source) {
    const sources = (source as string).split(',');
    conditions.push(`source IN (${sources.map(() => '?').join(',')})`);
    params.push(...sources);
  }
  if (location) {
    conditions.push('(state LIKE ? OR city LIKE ? OR location LIKE ?)');
    const l = `%${location}%`;
    params.push(l, l, l);
  }
  if (minEngagementScore) {
    conditions.push('engagement_score >= ?');
    params.push(parseInt(minEngagementScore as string));
  }
  if (tags) {
    const tagList = (tags as string).split(',');
    const tagConditions = tagList.map(() => 'tags LIKE ?');
    conditions.push(`(${tagConditions.join(' OR ')})`);
    params.push(...tagList.map(t => `%${t}%`));
  }
  if (consentStatus) {
    const statuses = (consentStatus as string).split(',');
    conditions.push(`consent_status IN (${statuses.map(() => '?').join(',')})`);
    params.push(...statuses);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const allowedSorts = ['created_at', 'full_name', 'engagement_score', 'experience_level', 'funnel_stage', 'updated_at', 'points'];
  const sort = allowedSorts.includes(sortBy as string) ? sortBy : 'created_at';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM talents ${where}`).get(...params) as any;
  const total = countRow.total;

  const p = Math.max(1, parseInt(page as string));
  const ps = Math.min(100, Math.max(1, parseInt(pageSize as string)));
  const offset = (p - 1) * ps;

  const rows = db.prepare(`SELECT * FROM talents ${where} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`).all(...params, ps, offset);

  const talents = rows.map(parseTalentRow);

  res.json({
    success: true,
    data: talents,
    meta: { page: p, pageSize: ps, total, totalPages: Math.ceil(total / ps) },
  });
});

// GET /api/talents/:id
talentRoutes.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Talent not found' });
  res.json({ success: true, data: parseTalentRow(row) });
});

// POST /api/talents
talentRoutes.post('/', (req, res) => {
  const db = getDb();
  const id = nanoid();
  const t = req.body;

  db.prepare(`INSERT INTO talents (
    id, full_name, preferred_name, email, phone, linkedin_url, github_url,
    location, state, city, sap_modules, sap_certifications, experience_level,
    years_of_experience, current_role, current_company, skills, languages,
    source, source_details, funnel_stage, engagement_score,
    consent_status, data_processing_basis, tags, notes,
    communication_preference
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, t.fullName, t.preferredName || null, t.email || null, t.phone || null,
    t.linkedinUrl || null, t.githubUrl || null,
    t.location || 'Brazil', t.state || null, t.city || null,
    JSON.stringify(t.sapModules || []), JSON.stringify(t.sapCertifications || []),
    t.experienceLevel || 'entry',
    t.yearsOfExperience || null, t.currentRole || null, t.currentCompany || null,
    JSON.stringify(t.skills || []), JSON.stringify(t.languages || ['Portuguese']),
    t.source || 'manual', t.sourceDetails || null,
    t.funnelStage || 'discovered', t.engagementScore || 0,
    'pending', 'legitimate_interest',
    JSON.stringify(t.tags || []), t.notes || '',
    t.communicationPreference || 'email'
  );

  const row = db.prepare('SELECT * FROM talents WHERE id = ?').get(id);
  res.status(201).json({ success: true, data: parseTalentRow(row) });
});

// PUT /api/talents/:id
talentRoutes.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Talent not found' });

  const t = req.body;
  const fields: string[] = [];
  const values: any[] = [];

  const map: Record<string, string> = {
    fullName: 'full_name', preferredName: 'preferred_name', email: 'email', phone: 'phone',
    linkedinUrl: 'linkedin_url', githubUrl: 'github_url', location: 'location', state: 'state', city: 'city',
    experienceLevel: 'experience_level', yearsOfExperience: 'years_of_experience',
    currentRole: 'current_role', currentCompany: 'current_company',
    source: 'source', sourceDetails: 'source_details',
    funnelStage: 'funnel_stage', engagementScore: 'engagement_score', points: 'points',
    consentStatus: 'consent_status', communicationPreference: 'communication_preference',
    notes: 'notes', assignedTo: 'assigned_to', nextFollowUpAt: 'next_follow_up_at',
  };

  for (const [key, col] of Object.entries(map)) {
    if (t[key] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(t[key]);
    }
  }

  const jsonFields: Record<string, string> = {
    sapModules: 'sap_modules', sapCertifications: 'sap_certifications', skills: 'skills',
    languages: 'languages', tags: 'tags', interestSignals: 'interest_signals',
    contentPreferences: 'content_preferences', challengesCompleted: 'challenges_completed',
    badgesEarned: 'badges_earned',
  };

  for (const [key, col] of Object.entries(jsonFields)) {
    if (t[key] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(JSON.stringify(t[key]));
    }
  }

  if (t.personalityInsights !== undefined) {
    fields.push('personality_insights = ?');
    values.push(JSON.stringify(t.personalityInsights));
  }

  if (fields.length > 0) {
    fields.push('updated_at = datetime("now")');
    values.push(req.params.id);
    db.prepare(`UPDATE talents SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  const row = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.id);
  res.json({ success: true, data: parseTalentRow(row) });
});

// DELETE /api/talents/:id
talentRoutes.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM talents WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ success: false, error: 'Talent not found' });
  res.json({ success: true });
});

// POST /api/talents/bulk-import
talentRoutes.post('/bulk-import', (req, res) => {
  const db = getDb();
  const { talents } = req.body;
  if (!Array.isArray(talents)) return res.status(400).json({ success: false, error: 'talents must be an array' });

  const insert = db.prepare(`INSERT INTO talents (
    id, full_name, preferred_name, email, experience_level, source, source_details,
    sap_modules, location, state, city, current_role, current_company,
    consent_status, data_processing_basis
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'legitimate_interest')`);

  const importMany = db.transaction((items: any[]) => {
    let imported = 0;
    for (const t of items) {
      try {
        insert.run(
          nanoid(), t.fullName, t.preferredName || null, t.email || null,
          t.experienceLevel || 'entry', t.source || 'import', t.sourceDetails || null,
          JSON.stringify(t.sapModules || []),
          t.location || 'Brazil', t.state || null, t.city || null,
          t.currentRole || null, t.currentCompany || null
        );
        imported++;
      } catch (e) { /* skip duplicates or errors */ }
    }
    return imported;
  });

  const imported = importMany(talents);
  res.json({ success: true, data: { imported, total: talents.length } });
});

// POST /api/talents/:id/move-stage
talentRoutes.post('/:id/move-stage', (req, res) => {
  const db = getDb();
  const { stage } = req.body;
  const validStages = ['discovered', 'enriched', 'outreach_ready', 'contacted', 'engaged', 'responded', 'screening', 'interviewing', 'offer', 'hired', 'declined'];
  if (!validStages.includes(stage)) return res.status(400).json({ success: false, error: 'Invalid stage' });

  db.prepare('UPDATE talents SET funnel_stage = ?, updated_at = datetime("now") WHERE id = ?').run(stage, req.params.id);
  const row = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Talent not found' });
  res.json({ success: true, data: parseTalentRow(row) });
});

function parseTalentRow(row: any): any {
  if (!row) return null;
  return {
    ...row,
    fullName: row.full_name,
    preferredName: row.preferred_name,
    linkedinUrl: row.linkedin_url,
    githubUrl: row.github_url,
    sapModules: JSON.parse(row.sap_modules || '[]'),
    sapCertifications: JSON.parse(row.sap_certifications || '[]'),
    experienceLevel: row.experience_level,
    yearsOfExperience: row.years_of_experience,
    currentRole: row.current_role,
    currentCompany: row.current_company,
    skills: JSON.parse(row.skills || '[]'),
    languages: JSON.parse(row.languages || '[]'),
    sourceDetails: row.source_details,
    discoveredAt: row.discovered_at,
    funnelStage: row.funnel_stage,
    engagementScore: row.engagement_score,
    interestSignals: JSON.parse(row.interest_signals || '[]'),
    profileCompleteness: row.profile_completeness,
    challengesCompleted: JSON.parse(row.challenges_completed || '[]'),
    badgesEarned: JSON.parse(row.badges_earned || '[]'),
    consentStatus: row.consent_status,
    consentDate: row.consent_date,
    dataProcessingBasis: row.data_processing_basis,
    personalityInsights: row.personality_insights ? JSON.parse(row.personality_insights) : null,
    contentPreferences: JSON.parse(row.content_preferences || '[]'),
    communicationPreference: row.communication_preference,
    bestContactTime: row.best_contact_time,
    tags: JSON.parse(row.tags || '[]'),
    lastContactedAt: row.last_contacted_at,
    nextFollowUpAt: row.next_follow_up_at,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
