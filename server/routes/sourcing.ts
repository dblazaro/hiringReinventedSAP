import { Router } from 'express';
import { getDb } from '../db/connection';
import { nanoid } from 'nanoid';

export const sourcingRoutes = Router();

// Get sourcing overview
sourcingRoutes.get('/overview', (_req, res) => {
  const db = getDb();

  const sourceStats = db.prepare(`
    SELECT source,
      COUNT(*) as total,
      AVG(engagement_score) as avg_engagement,
      SUM(CASE WHEN funnel_stage IN ('responded','screening','interviewing','offer','hired') THEN 1 ELSE 0 END) as converted
    FROM talents GROUP BY source ORDER BY total DESC
  `).all();

  res.json({
    success: true,
    data: {
      sources: sourceStats,
      availableChannels: [
        {
          id: 'github',
          name: 'GitHub',
          description: 'Discover SAP developers through code contributions, ABAP repositories, and SAP-related projects',
          searchStrategies: [
            'Search for ABAP, SAP UI5, SAP CAP, SAP BTP repositories',
            'Look for contributors to SAP open-source projects',
            'Identify developers with SAP-related pinned repositories',
            'Filter by location: Brazil',
          ],
          estimatedPool: 2500,
          status: 'active',
        },
        {
          id: 'sap_community',
          name: 'SAP Community',
          description: 'Source from SAP Community Network - blogs, Q&A, tutorials by SAP professionals',
          searchStrategies: [
            'Top contributors by SAP module',
            'Blog authors on S/4HANA, BTP, Fiori topics',
            'SAP Mentors and Champions from Brazil',
            'Active Q&A participants',
          ],
          estimatedPool: 8000,
          status: 'active',
        },
        {
          id: 'meetup',
          name: 'Meetups & Events',
          description: 'SAP Inside Track, SAP TechEd, local SAP user groups in Brazil',
          searchStrategies: [
            'SAP Inside Track attendees/speakers (SP, RJ, BH)',
            'ASUG Brasil event participants',
            'SAP TechEd virtual event registrants',
            'Local SAP user group organizers',
          ],
          estimatedPool: 3500,
          status: 'active',
        },
        {
          id: 'linkedin',
          name: 'LinkedIn (Enhanced)',
          description: 'Beyond basic search - analyze engagement, content creation, and community participation',
          searchStrategies: [
            'SAP professionals posting original content in PT-BR',
            'Members of SAP-specific LinkedIn groups in Brazil',
            'Professionals commenting on Accenture SAP content',
            'Alumni of SAP training programs',
          ],
          estimatedPool: 15000,
          status: 'active',
        },
        {
          id: 'publication',
          name: 'Publications & Research',
          description: 'Academic papers, blog posts, and technical articles on SAP topics',
          searchStrategies: [
            'Medium/Dev.to articles on SAP topics in Portuguese',
            'Academic papers on ERP/SAP from Brazilian universities',
            'SAP Press authors from Brazil',
            'YouTube/podcast creators covering SAP in Portuguese',
          ],
          estimatedPool: 1500,
          status: 'active',
        },
        {
          id: 'consulting_firm',
          name: 'Consulting Firms',
          description: 'Identify SAP professionals at competing firms and system integrators',
          searchStrategies: [
            'Track Big4/SI employee moves on LinkedIn',
            'Conference speaker lists from consulting firms',
            'Project award announcements mentioning SAP leads',
            'Published case studies with attributed consultants',
          ],
          estimatedPool: 5000,
          status: 'active',
        },
        {
          id: 'university',
          name: 'Universities & Training',
          description: 'Fresh graduates with SAP training, bootcamp graduates, certification holders',
          searchStrategies: [
            'SAP University Alliances program in Brazil',
            'Udacity SAP Technology Consultant graduates',
            'Recent SAP certification holders',
            'CS graduates from top Brazilian universities with ERP focus',
          ],
          estimatedPool: 4000,
          status: 'active',
        },
        {
          id: 'conference',
          name: 'Conferences & Webinars',
          description: 'Speakers and attendees at SAP and tech conferences',
          searchStrategies: [
            'SAP NOW Sao Paulo speakers and attendees',
            'SAPPHIRE registrants from Brazil',
            'Local tech conference SAP track speakers',
            'Webinar presenters on SAP topics',
          ],
          estimatedPool: 2000,
          status: 'active',
        },
      ],
    },
  });
});

// Simulate GitHub sourcing
sourcingRoutes.post('/search/github', (req, res) => {
  const { query, language, location } = req.body;

  // In production, this would call the GitHub API
  // For demo, return simulated results
  const results = [
    { username: 'abap_dev_sp', fullName: 'Developer SAP SP', repos: 12, sapRepos: 5, stars: 45, location: 'Sao Paulo, Brazil', topLanguages: ['ABAP', 'JavaScript'], profileUrl: 'https://github.com/abap_dev_sp' },
    { username: 'sap_btp_rio', fullName: 'BTP Dev Rio', repos: 8, sapRepos: 4, stars: 23, location: 'Rio de Janeiro, Brazil', topLanguages: ['JavaScript', 'TypeScript', 'ABAP'], profileUrl: 'https://github.com/sap_btp_rio' },
    { username: 'fiori_ux_dev', fullName: 'Fiori UX Developer', repos: 15, sapRepos: 7, stars: 67, location: 'Belo Horizonte, Brazil', topLanguages: ['JavaScript', 'XML', 'CSS'], profileUrl: 'https://github.com/fiori_ux_dev' },
  ];

  res.json({
    success: true,
    data: {
      query: query || 'SAP ABAP',
      location: location || 'Brazil',
      totalResults: results.length,
      results,
      note: 'Connect your GitHub API token in .env for live search results',
    },
  });
});

// Import discovered talents from sourcing
sourcingRoutes.post('/import', (req, res) => {
  const db = getDb();
  const { talents, source, sourceDetails } = req.body;

  if (!Array.isArray(talents)) {
    return res.status(400).json({ success: false, error: 'talents must be an array' });
  }

  const insert = db.prepare(`INSERT INTO talents (
    id, full_name, preferred_name, email, linkedin_url, github_url,
    location, state, city, sap_modules, experience_level,
    source, source_details, consent_status, data_processing_basis
  ) VALUES (?, ?, ?, ?, ?, ?, 'Brazil', ?, ?, ?, ?, ?, ?, 'pending', 'legitimate_interest')`);

  let imported = 0;
  const importTx = db.transaction((items: any[]) => {
    for (const t of items) {
      try {
        insert.run(
          nanoid(), t.fullName, t.preferredName || null, t.email || null,
          t.linkedinUrl || null, t.githubUrl || null,
          t.state || null, t.city || null,
          JSON.stringify(t.sapModules || []),
          t.experienceLevel || 'entry',
          source || t.source || 'manual',
          sourceDetails || t.sourceDetails || null
        );
        imported++;
      } catch (e) { /* skip */ }
    }
  });

  importTx(talents);

  res.json({ success: true, data: { imported, total: talents.length } });
});
