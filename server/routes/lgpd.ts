import { Router } from 'express';
import { getDb } from '../db/connection';
import { nanoid } from 'nanoid';

export const lgpdRoutes = Router();

// Get LGPD compliance overview
lgpdRoutes.get('/overview', (_req, res) => {
  const db = getDb();

  const totalTalents = (db.prepare('SELECT COUNT(*) as c FROM talents').get() as any).c;
  const consentGranted = (db.prepare('SELECT COUNT(*) as c FROM talents WHERE consent_status = "granted"').get() as any).c;
  const consentPending = (db.prepare('SELECT COUNT(*) as c FROM talents WHERE consent_status = "pending"').get() as any).c;
  const consentRevoked = (db.prepare('SELECT COUNT(*) as c FROM talents WHERE consent_status = "revoked"').get() as any).c;

  const recentLogs = db.prepare('SELECT * FROM consent_log ORDER BY created_at DESC LIMIT 20').all();

  res.json({
    success: true,
    data: {
      totalTalents,
      consentGranted,
      consentPending,
      consentRevoked,
      complianceRate: totalTalents > 0 ? ((consentGranted / totalTalents) * 100).toFixed(1) : 0,
      recentLogs,
      policies: {
        dataProcessingBases: ['legitimate_interest', 'consent', 'contract_execution'],
        retentionPeriod: '24 months from last interaction',
        dataCategories: ['identification', 'professional', 'contact', 'behavioral'],
        dpo: 'dpo@accenture.com',
        purposes: [
          'Talent sourcing and recruitment',
          'Skills assessment and matching',
          'Communication about career opportunities',
          'Gamification and engagement activities',
        ],
      },
    },
  });
});

// Grant consent for a talent
lgpdRoutes.post('/consent/:talentId/grant', (req, res) => {
  const db = getDb();
  const { basis, details } = req.body;

  db.prepare('UPDATE talents SET consent_status = "granted", consent_date = datetime("now"), data_processing_basis = ?, updated_at = datetime("now") WHERE id = ?')
    .run(basis || 'consent', req.params.talentId);

  db.prepare('INSERT INTO consent_log (id, talent_id, action, basis, details) VALUES (?, ?, ?, ?, ?)')
    .run(nanoid(), req.params.talentId, 'grant', basis || 'consent', details || 'Consent granted');

  res.json({ success: true, data: { status: 'granted' } });
});

// Revoke consent
lgpdRoutes.post('/consent/:talentId/revoke', (req, res) => {
  const db = getDb();
  const { details } = req.body;

  db.prepare('UPDATE talents SET consent_status = "revoked", updated_at = datetime("now") WHERE id = ?')
    .run(req.params.talentId);

  db.prepare('INSERT INTO consent_log (id, talent_id, action, basis, details) VALUES (?, ?, ?, ?, ?)')
    .run(nanoid(), req.params.talentId, 'revoke', 'subject_request', details || 'Consent revoked by data subject');

  res.json({ success: true, data: { status: 'revoked' } });
});

// Data subject access request (DSAR)
lgpdRoutes.get('/dsar/:talentId', (req, res) => {
  const db = getDb();
  const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.talentId) as any;
  if (!talent) return res.status(404).json({ success: false, error: 'Talent not found' });

  const outreach = db.prepare('SELECT * FROM outreach_history WHERE talent_id = ?').all(req.params.talentId);
  const activities = db.prepare('SELECT * FROM talent_activity WHERE talent_id = ?').all(req.params.talentId);
  const consentHistory = db.prepare('SELECT * FROM consent_log WHERE talent_id = ? ORDER BY created_at DESC').all(req.params.talentId);

  res.json({
    success: true,
    data: {
      personalData: {
        fullName: talent.full_name,
        email: talent.email,
        phone: talent.phone,
        location: `${talent.city || ''}, ${talent.state || ''}, ${talent.location}`,
        linkedinUrl: talent.linkedin_url,
        githubUrl: talent.github_url,
      },
      professionalData: {
        currentRole: talent.current_role,
        currentCompany: talent.current_company,
        experienceLevel: talent.experience_level,
        yearsOfExperience: talent.years_of_experience,
        sapModules: JSON.parse(talent.sap_modules || '[]'),
        skills: JSON.parse(talent.skills || '[]'),
      },
      processingDetails: {
        source: talent.source,
        sourceDetails: talent.source_details,
        discoveredAt: talent.discovered_at,
        consentStatus: talent.consent_status,
        consentDate: talent.consent_date,
        processingBasis: talent.data_processing_basis,
      },
      engagementData: {
        funnelStage: talent.funnel_stage,
        engagementScore: talent.engagement_score,
        points: talent.points,
        challengesCompleted: JSON.parse(talent.challenges_completed || '[]'),
        badgesEarned: JSON.parse(talent.badges_earned || '[]'),
      },
      communicationHistory: outreach,
      activityLog: activities,
      consentHistory,
      dataRetentionPolicy: 'Data retained for 24 months from last interaction. Contact dpo@accenture.com for deletion requests.',
    },
  });
});

// Right to erasure (Right to be forgotten)
lgpdRoutes.delete('/erase/:talentId', (req, res) => {
  const db = getDb();

  const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.talentId) as any;
  if (!talent) return res.status(404).json({ success: false, error: 'Talent not found' });

  // Log before deletion
  db.prepare('INSERT INTO consent_log (id, talent_id, action, basis, details) VALUES (?, ?, ?, ?, ?)')
    .run(nanoid(), req.params.talentId, 'erasure', 'subject_request', 'Data erased per LGPD right to erasure');

  // Delete related data
  db.prepare('DELETE FROM outreach_history WHERE talent_id = ?').run(req.params.talentId);
  db.prepare('DELETE FROM talent_activity WHERE talent_id = ?').run(req.params.talentId);
  db.prepare('DELETE FROM talents WHERE id = ?').run(req.params.talentId);

  res.json({ success: true, data: { message: 'All personal data has been erased per LGPD compliance' } });
});

// Export talent data (data portability)
lgpdRoutes.get('/export/:talentId', (req, res) => {
  const db = getDb();
  const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.talentId) as any;
  if (!talent) return res.status(404).json({ success: false, error: 'Talent not found' });

  // Return all data in portable format
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="talent-data-${req.params.talentId}.json"`);

  const exportData = {
    exportDate: new Date().toISOString(),
    format: 'LGPD Data Portability Export',
    personalData: talent,
    outreachHistory: db.prepare('SELECT * FROM outreach_history WHERE talent_id = ?').all(req.params.talentId),
    activities: db.prepare('SELECT * FROM talent_activity WHERE talent_id = ?').all(req.params.talentId),
    consentHistory: db.prepare('SELECT * FROM consent_log WHERE talent_id = ?').all(req.params.talentId),
  };

  res.json({ success: true, data: exportData });
});
