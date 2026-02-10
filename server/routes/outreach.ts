import { Router } from 'express';
import { getDb } from '../db/connection';
import { nanoid } from 'nanoid';

export const outreachRoutes = Router();

// Generate AI-personalized outreach message
outreachRoutes.post('/generate', (req, res) => {
  const db = getDb();
  const { talentId, templateId, channel, tone, includeAccentureContent, includeChallenge } = req.body;

  const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(talentId) as any;
  if (!talent) return res.status(404).json({ success: false, error: 'Talent not found' });

  // Get template if specified
  let template: any = null;
  if (templateId) {
    template = db.prepare('SELECT * FROM message_templates WHERE id = ?').get(templateId);
  } else {
    // Auto-select best template based on experience level
    template = db.prepare(
      'SELECT * FROM message_templates WHERE (experience_level = ? OR experience_level = "all") AND category = "initial_outreach" ORDER BY response_rate DESC LIMIT 1'
    ).get(talent.experience_level);
  }

  // Get relevant content for this talent
  const sapModules = JSON.parse(talent.sap_modules || '[]');
  let contentPieces: any[] = [];
  if (includeAccentureContent !== false) {
    contentPieces = db.prepare(
      `SELECT * FROM content_pieces WHERE
       (experience_level = ? OR experience_level = 'all')
       ${sapModules.length > 0 ? `AND (${sapModules.map(() => 'sap_modules LIKE ?').join(' OR ')})` : ''}
       ORDER BY engagement_count DESC LIMIT 3`
    ).all(talent.experience_level, ...sapModules.map((m: string) => `%${m}%`));
  }

  // Get relevant challenge
  let challenge: any = null;
  if (includeChallenge !== false) {
    challenge = db.prepare(
      'SELECT * FROM challenges WHERE difficulty = ? AND is_active = 1 ORDER BY completions ASC LIMIT 1'
    ).get(talent.experience_level);
  }

  // Build personalized message (AI simulation - in production, use OpenAI API)
  const preferredName = talent.preferred_name || talent.full_name.split(' ')[0];
  const personalizedElements: string[] = [];
  let body = template?.body || getDefaultTemplate(talent.experience_level);

  // Replace variables
  const vars: Record<string, string> = {
    '{{preferredName}}': preferredName,
    '{{fullName}}': talent.full_name,
    '{{sapModule}}': sapModules[0] || 'SAP',
    '{{sourceContext}}': getSourceContext(talent.source, talent.source_details),
    '{{senderName}}': 'Equipe TalentFlow',
    '{{challengeTime}}': challenge ? String(challenge.time_limit) : '15',
    '{{challengeLink}}': challenge ? `[Aceitar Desafio: ${challenge.title}]` : '',
    '{{contentLink}}': contentPieces[0] ? `[${contentPieces[0].title}]` : '',
    '{{contentSummary}}': contentPieces[0]?.summary || '',
    '{{relevantProject}}': getRelevantProject(sapModules),
    '{{relevantTrend}}': getRelevantTrend(sapModules),
    '{{insightPreview}}': 'empresas que adotaram essa abordagem viram 40% mais agilidade',
    '{{relevantTopic}}': sapModules[0] || 'transformacao digital SAP',
    '{{relevantArea}}': sapModules[0] || 'inovacao SAP',
    '{{eventDetails}}': 'lideres SAP de empresas Fortune 500',
    '{{previousSubject}}': 'Oportunidade SAP',
    '{{challengeTitle}}': challenge?.title || 'SAP Skills Assessment',
    '{{exclusiveReward}}': 'mentoria 1:1 com SAP experts da Accenture',
    '{{participantCount}}': String(120 + Math.floor(Math.random() * 200)),
  };

  for (const [key, value] of Object.entries(vars)) {
    if (body.includes(key)) {
      body = body.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
      personalizedElements.push(key.replace(/[{}]/g, ''));
    }
  }

  // Apply tone adjustment
  if (tone === 'casual') {
    personalizedElements.push('casual_tone');
  } else if (tone === 'technical') {
    personalizedElements.push('technical_tone');
  }

  const subject = template?.subject
    ? Object.entries(vars).reduce((s, [k, v]) => s.replace(new RegExp(k.replace(/[{}]/g, '\\$&'), 'g'), v), template.subject)
    : `${preferredName}, uma oportunidade SAP para voce`;

  res.json({
    success: true,
    data: {
      subject,
      body,
      personalizedElements,
      suggestedContentPieces: contentPieces.map((c: any) => c.title),
      suggestedChallenge: challenge?.title || null,
      estimatedEngagementScore: Math.floor(40 + Math.random() * 40),
      lgpdCompliant: talent.consent_status !== 'revoked',
      channel: channel || talent.communication_preference || 'email',
    },
  });
});

// Send outreach message
outreachRoutes.post('/send', (req, res) => {
  const db = getDb();
  const { talentId, campaignId, subject, body, channel, personalizedElements } = req.body;

  // Verify LGPD consent
  const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(talentId) as any;
  if (!talent) return res.status(404).json({ success: false, error: 'Talent not found' });
  if (talent.consent_status === 'revoked') {
    return res.status(403).json({ success: false, error: 'Cannot contact: consent revoked (LGPD)' });
  }

  const id = nanoid();
  db.prepare(`INSERT INTO outreach_history (id, talent_id, campaign_id, channel, subject, body, personalized_elements, status, sent_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', datetime('now'))`).run(
    id, talentId, campaignId || null, channel || 'email', subject || null, body,
    JSON.stringify(personalizedElements || [])
  );

  // Update talent
  db.prepare('UPDATE talents SET funnel_stage = CASE WHEN funnel_stage IN ("discovered","enriched","outreach_ready") THEN "contacted" ELSE funnel_stage END, last_contacted_at = datetime("now"), updated_at = datetime("now") WHERE id = ?').run(talentId);

  // Log activity
  db.prepare('INSERT INTO talent_activity (id, talent_id, activity_type, details) VALUES (?, ?, ?, ?)').run(
    nanoid(), talentId, 'outreach_sent', JSON.stringify({ channel, campaignId })
  );

  res.json({ success: true, data: { id, status: 'sent' } });
});

// Get outreach history for a talent
outreachRoutes.get('/history/:talentId', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM outreach_history WHERE talent_id = ? ORDER BY created_at DESC').all(req.params.talentId);
  res.json({ success: true, data: rows });
});

// Bulk outreach
outreachRoutes.post('/bulk-send', (req, res) => {
  const db = getDb();
  const { talentIds, campaignId, templateId, channel } = req.body;

  if (!Array.isArray(talentIds) || talentIds.length === 0) {
    return res.status(400).json({ success: false, error: 'talentIds must be a non-empty array' });
  }

  let sent = 0;
  let skipped = 0;

  const sendOne = db.transaction((tid: string) => {
    const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(tid) as any;
    if (!talent || talent.consent_status === 'revoked') {
      skipped++;
      return;
    }

    const id = nanoid();
    db.prepare(`INSERT INTO outreach_history (id, talent_id, campaign_id, template_id, channel, subject, body, status, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'sent', datetime('now'))`).run(
      id, tid, campaignId || null, templateId || null, channel || 'email',
      'Outreach via campaign', '[AI-generated personalized content]'
    );

    db.prepare('UPDATE talents SET funnel_stage = CASE WHEN funnel_stage IN ("discovered","enriched","outreach_ready") THEN "contacted" ELSE funnel_stage END, last_contacted_at = datetime("now"), updated_at = datetime("now") WHERE id = ?').run(tid);
    sent++;
  });

  for (const tid of talentIds) {
    sendOne(tid);
  }

  // Update campaign metrics
  if (campaignId) {
    db.prepare('UPDATE campaigns SET sent = sent + ?, updated_at = datetime("now") WHERE id = ?').run(sent, campaignId);
  }

  res.json({ success: true, data: { sent, skipped, total: talentIds.length } });
});

function getSourceContext(source: string, details: string | null): string {
  const contexts: Record<string, string> = {
    github: 'atraves das suas contribuicoes no GitHub',
    meetup: 'em um evento da comunidade SAP',
    linkedin: 'pelo seu perfil profissional',
    publication: 'por uma publicacao sua que me chamou atencao',
    consulting_firm: 'pela sua trajetoria em consultoria',
    sap_community: 'pela sua participacao na SAP Community',
    conference: 'em uma conferencia de tecnologia',
    university: 'pelo seu perfil academico',
    referral: 'por indicacao de um colega',
  };
  return contexts[source] || 'pelo seu perfil';
}

function getRelevantProject(modules: string[]): string {
  if (modules.includes('SAP S/4HANA')) return 'migracao S/4HANA de uma das maiores varejistas do Brasil';
  if (modules.includes('SAP BTP')) return 'plataforma de inovacao BTP para um banco lider';
  if (modules.includes('SAP Fiori')) return 'redesign completo da experiencia do usuario para 10.000 funcionarios';
  return 'transformacao digital de empresas Fortune 500 no Brasil';
}

function getRelevantTrend(modules: string[]): string {
  if (modules.includes('SAP S/4HANA')) return 'adocao de Clean Core em empresas brasileiras';
  if (modules.includes('SAP BTP')) return 'integracao de GenAI com SAP BTP';
  if (modules.includes('SAP ABAP')) return 'evolucao do ABAP Cloud e RAP';
  return 'transformacao digital com SAP no mercado brasileiro';
}

function getDefaultTemplate(level: string): string {
  return `Ola {{preferredName}},

Encontramos seu perfil {{sourceContext}} e ficamos impressionados com sua experiencia em {{sapModule}}.

A Accenture esta expandindo sua pratica SAP no Brasil e buscamos profissionais como voce.

Que tal conversarmos? Tenho certeza que temos oportunidades alinhadas ao seu momento de carreira.

Abraco,
{{senderName}}`;
}
