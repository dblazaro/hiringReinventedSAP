import dotenv from 'dotenv';
dotenv.config();

import { getDb, closeDb } from './connection';
import { SCHEMA } from './schema';
import { nanoid } from 'nanoid';

function seed() {
  console.log('Seeding database...');
  const db = getDb();
  db.exec(SCHEMA);

  // --- Badges ---
  const badges = [
    { id: 'badge_sap_explorer', name: 'SAP Explorer', description: 'Completed your first SAP challenge', icon: 'compass', category: 'skill', requirement: 'Complete 1 challenge', rarity: 'common' },
    { id: 'badge_abap_warrior', name: 'ABAP Warrior', description: 'Mastered ABAP fundamentals', icon: 'sword', category: 'skill', requirement: 'Score 80%+ on ABAP quiz', rarity: 'rare' },
    { id: 'badge_s4_pioneer', name: 'S/4HANA Pioneer', description: 'Demonstrated S/4HANA expertise', icon: 'rocket', category: 'skill', requirement: 'Complete S/4HANA assessment', rarity: 'epic' },
    { id: 'badge_community_star', name: 'Community Star', description: 'Active community contributor', icon: 'star', category: 'community', requirement: 'Refer 3 professionals', rarity: 'rare' },
    { id: 'badge_innovator', name: 'Innovation Leader', description: 'Proposed an innovative SAP solution', icon: 'lightbulb', category: 'achievement', requirement: 'Submit innovation proposal', rarity: 'legendary' },
    { id: 'badge_quick_responder', name: 'Quick Responder', description: 'Responded within 24 hours', icon: 'zap', category: 'engagement', requirement: 'Respond to outreach within 24h', rarity: 'common' },
    { id: 'badge_profile_complete', name: 'Profile Master', description: '100% profile completion', icon: 'user-check', category: 'engagement', requirement: 'Complete all profile fields', rarity: 'common' },
    { id: 'badge_btp_architect', name: 'BTP Architect', description: 'Proven BTP platform skills', icon: 'cloud', category: 'skill', requirement: 'Score 90%+ on BTP assessment', rarity: 'epic' },
  ];

  const insertBadge = db.prepare('INSERT OR IGNORE INTO badges (id, name, description, icon, category, requirement, rarity) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const b of badges) {
    insertBadge.run(b.id, b.name, b.description, b.icon, b.category, b.requirement, b.rarity);
  }

  // --- Challenges ---
  const challenges = [
    {
      id: 'ch_abap_basics', title: 'ABAP Fundamentals Challenge', description: 'Test your core ABAP knowledge with real-world scenarios',
      type: 'quiz', difficulty: 'entry', sap_module: 'SAP ABAP', points: 100, badge_id: 'badge_sap_explorer', time_limit: 15,
      content: JSON.stringify({
        questions: [
          { q: 'What does ABAP stand for?', options: ['Advanced Business Application Programming', 'Automated Business App Platform', 'Applied Business Analytics Processing', 'Advanced Batch Application Programming'], correct: 0 },
          { q: 'Which transaction is used to create ABAP programs?', options: ['SE38', 'SE80', 'SE11', 'Both SE38 and SE80'], correct: 3 },
          { q: 'What is an internal table in ABAP?', options: ['A database table', 'A temporary in-memory data structure', 'An external file', 'A configuration table'], correct: 1 },
          { q: 'Which ABAP statement is used for loops?', options: ['FOR EACH', 'LOOP AT', 'ITERATE', 'WHILE ONLY'], correct: 1 },
          { q: 'What is the purpose of SAP Data Dictionary (SE11)?', options: ['Writing reports', 'Defining database objects', 'User management', 'Transport management'], correct: 1 },
        ]
      })
    },
    {
      id: 'ch_s4hana_migration', title: 'S/4HANA Migration Strategy', description: 'Design a migration approach for a mid-size manufacturer',
      type: 'mini_project', difficulty: 'lead', sap_module: 'SAP S/4HANA', points: 500, badge_id: 'badge_s4_pioneer', time_limit: 60,
      content: JSON.stringify({
        scenario: 'A Brazilian auto-parts manufacturer running SAP ECC 6.0 wants to migrate to S/4HANA. They have 500 users, custom ABAP programs, and integrations with 3 external systems. Create a high-level migration strategy.',
        deliverables: ['Migration approach (Greenfield vs Brownfield justification)', 'Timeline estimate', 'Key risk areas', 'Testing strategy'],
        rubric: { approach: 30, timeline: 20, risks: 25, testing: 25 }
      })
    },
    {
      id: 'ch_btp_integration', title: 'BTP Integration Challenge', description: 'Build a simple integration flow using SAP BTP concepts',
      type: 'assessment', difficulty: 'experienced', sap_module: 'SAP BTP', points: 300, badge_id: 'badge_btp_architect', time_limit: 30,
      content: JSON.stringify({
        scenario: 'Design an integration between SAP S/4HANA and a third-party logistics provider using SAP Integration Suite on BTP.',
        questions: [
          { q: 'Which BTP service would you use for real-time event processing?', type: 'open' },
          { q: 'How would you handle authentication between systems?', type: 'open' },
          { q: 'Describe your error handling strategy', type: 'open' },
          { q: 'How would you monitor the integration health?', type: 'open' },
        ]
      })
    },
    {
      id: 'ch_fiori_ux', title: 'Fiori UX Design Sprint', description: 'Redesign a legacy SAP transaction as a modern Fiori app',
      type: 'mini_project', difficulty: 'experienced', sap_module: 'SAP Fiori', points: 350, badge_id: null, time_limit: 45,
      content: JSON.stringify({
        scenario: 'Redesign the ME21N (Purchase Order creation) transaction as a Fiori application optimized for mobile use by warehouse managers.',
        deliverables: ['User persona description', 'Key screen wireframes (text description)', 'Navigation flow', 'Responsive design considerations'],
      })
    },
    {
      id: 'ch_expert_architecture', title: 'Enterprise Architecture Review', description: 'Evaluate and improve a complex SAP landscape',
      type: 'assessment', difficulty: 'expert', sap_module: 'SAP S/4HANA', points: 1000, badge_id: 'badge_innovator', time_limit: 90,
      content: JSON.stringify({
        scenario: 'A large Brazilian bank is running a hybrid SAP landscape with S/4HANA on-premise, SuccessFactors, Ariba, and multiple BTP extensions. They are experiencing performance issues, high TCO, and slow innovation cycles.',
        questions: [
          { q: 'Analyze the landscape and identify top 3 architectural improvements', type: 'open' },
          { q: 'Propose a Clean Core strategy with specific recommendations', type: 'open' },
          { q: 'How would you leverage RISE with SAP for this client?', type: 'open' },
          { q: 'Design a roadmap for cloud transformation over 3 years', type: 'open' },
        ]
      })
    },
  ];

  const insertChallenge = db.prepare('INSERT OR IGNORE INTO challenges (id, title, description, type, difficulty, sap_module, points, badge_id, time_limit, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const c of challenges) {
    insertChallenge.run(c.id, c.title, c.description, c.type, c.difficulty, c.sap_module, c.points, c.badge_id, c.time_limit, c.content);
  }

  // --- Content Pieces (Accenture & SAP assets) ---
  const contentPieces = [
    { id: 'cnt_1', title: 'RISE with SAP: Transforming Business in the Cloud', type: 'whitepaper', source: 'accenture', url: 'https://www.accenture.com/us-en/services/sap/rise-with-sap', summary: 'How Accenture helps enterprises adopt RISE with SAP for cloud-first transformation, covering migration strategies and business outcomes.', sap_modules: '["SAP S/4HANA","SAP BTP"]', experience_level: 'all', tags: '["cloud","transformation","RISE"]', is_accenture_asset: 1 },
    { id: 'cnt_2', title: 'SAP S/4HANA: The Intelligent Enterprise', type: 'case_study', source: 'accenture', url: 'https://www.accenture.com/us-en/services/sap/s4hana', summary: 'Real-world case studies of S/4HANA implementations driving operational excellence across industries in Latin America.', sap_modules: '["SAP S/4HANA"]', experience_level: 'experienced', tags: '["S/4HANA","case_study","LATAM"]', is_accenture_asset: 1 },
    { id: 'cnt_3', title: 'Accenture & SAP Business Technology Platform', type: 'article', source: 'accenture', url: 'https://www.accenture.com/us-en/services/sap/business-technology-platform', summary: 'Leveraging SAP BTP for innovation, integration, and extension of SAP landscapes with Accenture expertise.', sap_modules: '["SAP BTP"]', experience_level: 'lead', tags: '["BTP","innovation","platform"]', is_accenture_asset: 1 },
    { id: 'cnt_4', title: 'SAP Learning Journey on Udacity', type: 'course', source: 'udacity', url: 'https://www.udacity.com/course/sap-technology-consultant--nd100', summary: 'Free nanodegree program in partnership with SAP covering technology consulting fundamentals and SAP ecosystem.', sap_modules: '["SAP Basis","SAP S/4HANA"]', experience_level: 'entry', tags: '["learning","free","certification"]', is_accenture_asset: 0 },
    { id: 'cnt_5', title: 'Clean Core Strategy for SAP', type: 'whitepaper', source: 'accenture', summary: 'Best practices for maintaining a clean core in SAP S/4HANA while enabling innovation through extensions on BTP.', sap_modules: '["SAP S/4HANA","SAP BTP"]', experience_level: 'expert', tags: '["clean_core","architecture","best_practices"]', is_accenture_asset: 1 },
    { id: 'cnt_6', title: 'Generative AI in SAP: Joule and Beyond', type: 'article', source: 'sap', summary: 'How SAP Joule and generative AI capabilities are transforming business processes across the SAP portfolio.', sap_modules: '["SAP BTP","SAP S/4HANA"]', experience_level: 'all', tags: '["AI","Joule","GenAI","innovation"]', is_accenture_asset: 0 },
    { id: 'cnt_7', title: 'Accenture Technology Vision 2025: AI Revolution', type: 'article', source: 'accenture', summary: 'Accenture annual technology vision exploring how AI is reshaping industries and creating new opportunities for SAP professionals.', sap_modules: '[]', experience_level: 'all', tags: '["AI","future","technology_vision"]', is_accenture_asset: 1 },
    { id: 'cnt_8', title: 'SAP Community: Brasil SAP User Group', type: 'event', source: 'sap_community', summary: 'Monthly meetup of SAP professionals in Brazil sharing knowledge, best practices, and networking opportunities.', sap_modules: '[]', experience_level: 'all', tags: '["community","networking","Brazil"]', is_accenture_asset: 0 },
    { id: 'cnt_9', title: 'Accenture myNav for SAP', type: 'article', source: 'accenture', summary: 'Platform-driven approach to SAP transformation using AI-powered insights for roadmap planning and value realization.', sap_modules: '["SAP S/4HANA"]', experience_level: 'lead', tags: '["myNav","platform","AI"]', is_accenture_asset: 1 },
    { id: 'cnt_10', title: 'ABAP Cloud Development Model', type: 'course', source: 'sap', summary: 'Learn the new ABAP Cloud development model including RAP (RESTful ABAP Programming) and clean ABAP practices.', sap_modules: '["SAP ABAP","SAP BTP"]', experience_level: 'experienced', tags: '["ABAP","cloud","RAP","development"]', is_accenture_asset: 0 },
  ];

  const insertContent = db.prepare("INSERT OR IGNORE INTO content_pieces (id, title, type, source, url, summary, sap_modules, experience_level, tags, is_accenture_asset, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))");
  for (const c of contentPieces) {
    insertContent.run(c.id, c.title, c.type, c.source, c.url || null, c.summary, c.sap_modules, c.experience_level, c.tags, c.is_accenture_asset);
  }

  // --- Message Templates ---
  const templates = [
    {
      id: 'tpl_entry_initial', name: 'Entry Level - Discovery Invitation', channel: 'email',
      subject: '{{preferredName}}, inicie sua jornada SAP com a Accenture',
      body: `Ola {{preferredName}},

Percebi seu interesse em tecnologia e quero te apresentar uma oportunidade unica. A Accenture esta investindo fortemente em profissionais SAP no Brasil, e encontramos seu perfil {{sourceContext}}.

O que temos para voce:
- Programa de formacao SAP com certificacao inclusa (parceria SAP + Udacity)
- Mentoria com especialistas de nivel global
- Projetos reais em grandes empresas brasileiras
- Plano de carreira acelerado

Preparei um desafio rapido ({{challengeTime}} min) que vai te mostrar como e trabalhar com SAP na pratica. Ao completar, voce ganha acesso exclusivo a conteudos e vagas antes de todo mundo.

{{challengeLink}}

Aceita o desafio?

Abraco,
{{senderName}}
Accenture | SAP Practice`,
      variables: '["preferredName","sourceContext","challengeTime","challengeLink","senderName"]',
      experience_level: 'entry', category: 'initial_outreach'
    },
    {
      id: 'tpl_exp_initial', name: 'Experienced - Value Proposition', channel: 'email',
      subject: '{{preferredName}}, sua experiencia em {{sapModule}} e exatamente o que procuramos',
      body: `Ola {{preferredName}},

Sou {{senderName}} da pratica SAP da Accenture Brasil. Encontrei seu perfil {{sourceContext}} e fiquei impressionado com sua trajetoria em {{sapModule}}.

Estamos liderando projetos de transformacao digital com SAP que estao redefinindo o mercado brasileiro. Pense em {{relevantProject}}.

O que nos diferencia para profissionais como voce:
- Projetos de alta complexidade com tecnologia de ponta (S/4HANA, BTP, AI)
- Acesso ao maior ecosistema SAP do mundo
- Certificacoes custeadas + treinamentos exclusivos
- Flexibilidade e modelo de trabalho moderno

Preparei um conteudo exclusivo que acho que voce vai curtir: {{contentLink}}

Tambem temos um assessment rapido que pode revelar seu nivel de expertise e conectar voce a oportunidades alinhadas: {{challengeLink}}

Que tal uma conversa rapida de 15 min?

{{senderName}}
Accenture | SAP Practice Brasil`,
      variables: '["preferredName","senderName","sourceContext","sapModule","relevantProject","contentLink","challengeLink"]',
      experience_level: 'experienced', category: 'initial_outreach'
    },
    {
      id: 'tpl_lead_initial', name: 'Lead - Strategic Partnership', channel: 'email',
      subject: '{{preferredName}}, uma visao sobre o futuro do SAP no Brasil',
      body: `{{preferredName}},

{{senderName}} aqui, da Accenture Brasil. Acompanho o trabalho que voce tem feito em {{sapModule}} {{sourceContext}} e reconheco a senioridade do seu perfil.

Quero compartilhar algo antes de falar sobre oportunidades: nosso ultimo estudo sobre {{relevantTrend}} mostra que {{insightPreview}}. O report completo esta aqui: {{contentLink}}

Na Accenture, estamos montando squads de elite para liderar as maiores transformacoes SAP do Brasil. Buscamos pessoas que nao apenas executam, mas que definem a estrategia.

O que oferecemos para lideres como voce:
- Papel estrategico em projetos de R$ 50M+
- Equipe senior sob sua lideranca
- Acesso a inovacao global da Accenture (myNav, SynOps)
- Participacao em decisoes arquiteturais de nivel enterprise

Seria valioso trocarmos perspectivas sobre {{relevantTopic}}. 20 minutos na sua agenda?

{{senderName}}
Accenture | SAP Practice Lead`,
      variables: '["preferredName","senderName","sapModule","sourceContext","relevantTrend","insightPreview","contentLink","relevantTopic"]',
      experience_level: 'lead', category: 'initial_outreach'
    },
    {
      id: 'tpl_expert_initial', name: 'Expert - Thought Leadership', channel: 'email',
      subject: '{{preferredName}}, convite para co-criar o futuro do SAP',
      body: `{{preferredName}},

Sou {{senderName}}, e lidero iniciativas estrategicas SAP na Accenture Brasil. Seu nome aparece consistentemente quando falamos dos maiores experts em {{sapModule}} do mercado brasileiro.

Nao vou comecar falando de vaga. Quero falar de impacto.

Estamos moldando a proxima geracao da pratica SAP na America Latina e buscamos mentes como a sua para:
- Co-criar nossa visao de SAP + GenAI para o mercado brasileiro
- Participar do nosso advisory board de inovacao SAP
- Liderar nossa estrategia de {{relevantArea}} com alcance global

Publiquei recentemente um ponto de vista sobre {{relevantTrend}} que gostaria da sua perspectiva: {{contentLink}}

Tambem estamos organizando um evento exclusivo com {{eventDetails}}. Gostaria de convida-lo como speaker/panelista.

Quando podemos conversar? Faco questao de adaptar a minha agenda.

{{senderName}}
Accenture | SAP Strategy & Advisory`,
      variables: '["preferredName","senderName","sapModule","relevantArea","relevantTrend","contentLink","eventDetails"]',
      experience_level: 'expert', category: 'initial_outreach'
    },
    {
      id: 'tpl_followup_content', name: 'Follow-up with Content', channel: 'email',
      subject: 'Re: {{previousSubject}} - conteudo que prometi',
      body: `{{preferredName}},

Seguindo nossa conversa, separei este material que acho que vai agregar: {{contentLink}}

{{contentSummary}}

O que achou? Se quiser, temos mais materiais sobre {{sapModule}} que posso compartilhar.

{{senderName}}`,
      variables: '["preferredName","previousSubject","contentLink","contentSummary","sapModule","senderName"]',
      experience_level: 'all', category: 'content_share'
    },
    {
      id: 'tpl_challenge_invite', name: 'Challenge Invitation', channel: 'email',
      subject: '{{preferredName}}, um desafio SAP a sua altura',
      body: `{{preferredName}},

Preparei algo especial: um desafio de {{challengeTitle}} que testa habilidades reais em {{sapModule}}.

Por que participar:
- Descubra como voce se compara aos melhores do mercado
- Ganhe badges e pontos no nosso ranking de talentos
- Os melhores scores ganham acesso a {{exclusiveReward}}
- Tempo estimado: {{challengeTime}} minutos

{{challengeLink}}

Ja temos {{participantCount}} profissionais participando. Aceita o desafio?

{{senderName}}`,
      variables: '["preferredName","challengeTitle","sapModule","exclusiveReward","challengeTime","challengeLink","participantCount","senderName"]',
      experience_level: 'all', category: 'challenge_invite'
    },
  ];

  const insertTemplate = db.prepare('INSERT OR IGNORE INTO message_templates (id, name, channel, subject, body, variables, experience_level, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const t of templates) {
    insertTemplate.run(t.id, t.name, t.channel, t.subject, t.body, t.variables, t.experience_level, t.category);
  }

  // --- Sample Campaigns ---
  const campaigns = [
    {
      id: 'camp_entry_wave1', name: 'Entry Level SAP Discovery - Wave 1', description: 'First wave targeting entry-level talent from universities and tech communities',
      status: 'active', target_experience_levels: '["entry"]', target_sap_modules: '["SAP ABAP","SAP Basis"]', target_locations: '["Sao Paulo","Rio de Janeiro","Belo Horizonte"]',
      channel: 'email', steps: JSON.stringify([
        { id: 's1', order: 1, name: 'Discovery Invitation', channel: 'email', templateId: 'tpl_entry_initial', delayDays: 0, aiPersonalization: true },
        { id: 's2', order: 2, name: 'Challenge Reminder', channel: 'email', templateId: 'tpl_challenge_invite', delayDays: 3, condition: 'no_response', aiPersonalization: true },
        { id: 's3', order: 3, name: 'Content Share', channel: 'email', templateId: 'tpl_followup_content', delayDays: 7, condition: 'no_response', aiPersonalization: true },
      ]),
      total_targets: 1200, sent: 890, delivered: 845, opened: 412, responded: 67, engaged: 34,
    },
    {
      id: 'camp_exp_s4hana', name: 'S/4HANA Experienced Professionals', description: 'Targeting experienced S/4HANA consultants and developers',
      status: 'active', target_experience_levels: '["experienced"]', target_sap_modules: '["SAP S/4HANA","SAP Fiori"]', target_locations: '["Brazil"]',
      channel: 'email', steps: JSON.stringify([
        { id: 's1', order: 1, name: 'Value Proposition', channel: 'email', templateId: 'tpl_exp_initial', delayDays: 0, aiPersonalization: true },
        { id: 's2', order: 2, name: 'Content Follow-up', channel: 'email', templateId: 'tpl_followup_content', delayDays: 5, condition: 'opened_not_responded', aiPersonalization: true },
        { id: 's3', order: 3, name: 'Challenge Invite', channel: 'email', templateId: 'tpl_challenge_invite', delayDays: 10, condition: 'no_response', aiPersonalization: true },
      ]),
      total_targets: 2100, sent: 1650, delivered: 1590, opened: 823, responded: 145, engaged: 89,
    },
    {
      id: 'camp_lead_strategic', name: 'Lead Architects - Strategic Outreach', description: 'High-touch campaign for senior SAP leads and architects',
      status: 'active', target_experience_levels: '["lead"]', target_sap_modules: '["SAP S/4HANA","SAP BTP"]', target_locations: '["Brazil"]',
      channel: 'email', steps: JSON.stringify([
        { id: 's1', order: 1, name: 'Strategic Partnership', channel: 'email', templateId: 'tpl_lead_initial', delayDays: 0, aiPersonalization: true },
        { id: 's2', order: 2, name: 'Thought Leadership Share', channel: 'linkedin', templateId: 'tpl_followup_content', delayDays: 7, condition: 'no_response', aiPersonalization: true },
      ]),
      total_targets: 450, sent: 320, delivered: 310, opened: 198, responded: 52, engaged: 38,
    },
  ];

  const insertCampaign = db.prepare('INSERT OR IGNORE INTO campaigns (id, name, description, status, target_experience_levels, target_sap_modules, target_locations, channel, steps, total_targets, sent, delivered, opened, responded, engaged) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const c of campaigns) {
    insertCampaign.run(c.id, c.name, c.description, c.status, c.target_experience_levels, c.target_sap_modules, c.target_locations, c.channel, c.steps, c.total_targets, c.sent, c.delivered, c.opened, c.responded, c.engaged);
  }

  // --- Sample Talents (diverse profiles across levels) ---
  const sapModulesPool = ['SAP S/4HANA', 'SAP ABAP', 'SAP BTP', 'SAP Fiori', 'SAP MM', 'SAP SD', 'SAP FI/CO', 'SAP PP', 'SAP Basis', 'SAP SuccessFactors', 'SAP Ariba', 'SAP Integration Suite', 'SAP Analytics Cloud', 'SAP HANA'];
  const brazilStates = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF', 'GO', 'ES'];
  const cities: Record<string, string[]> = {
    SP: ['Sao Paulo', 'Campinas', 'Santos', 'Ribeirao Preto'],
    RJ: ['Rio de Janeiro', 'Niteroi'],
    MG: ['Belo Horizonte', 'Uberlandia'],
    RS: ['Porto Alegre', 'Caxias do Sul'],
    PR: ['Curitiba', 'Londrina'],
    SC: ['Florianopolis', 'Joinville'],
    BA: ['Salvador'],
    PE: ['Recife'],
    CE: ['Fortaleza'],
    DF: ['Brasilia'],
    GO: ['Goiania'],
    ES: ['Vitoria'],
  };
  const sources: Array<{ source: string; details: string }> = [
    { source: 'github', details: 'Active SAP ABAP repository contributor' },
    { source: 'meetup', details: 'SAP Inside Track Sao Paulo attendee' },
    { source: 'linkedin', details: 'SAP keyword match in profile' },
    { source: 'publication', details: 'SAP Community blog author' },
    { source: 'consulting_firm', details: 'Former Big4 SAP consultant' },
    { source: 'sap_community', details: 'SAP Community Network active member' },
    { source: 'conference', details: 'SAP TechEd speaker/attendee' },
    { source: 'university', details: 'Computer Science graduate, SAP research project' },
    { source: 'referral', details: 'Referred by existing Accenture consultant' },
  ];
  const funnelStages = ['discovered', 'enriched', 'outreach_ready', 'contacted', 'engaged', 'responded', 'screening', 'interviewing', 'offer', 'hired', 'declined'] as const;
  const firstNames = ['Lucas', 'Mariana', 'Gabriel', 'Juliana', 'Rafael', 'Camila', 'Pedro', 'Fernanda', 'Thiago', 'Amanda', 'Bruno', 'Carolina', 'Diego', 'Leticia', 'Felipe', 'Beatriz', 'Rodrigo', 'Larissa', 'Matheus', 'Isabella', 'Gustavo', 'Patricia', 'Andre', 'Vanessa', 'Ricardo', 'Daniela', 'Marcelo', 'Priscila', 'Eduardo', 'Renata', 'Leonardo', 'Tatiana', 'Carlos', 'Aline', 'Vinicius', 'Sabrina', 'Henrique', 'Bruna', 'Paulo', 'Monica'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Araujo', 'Melo', 'Barbosa', 'Nascimento', 'Moreira', 'Cardoso'];
  const companies = ['Accenture', 'Deloitte', 'EY', 'KPMG', 'IBM', 'Capgemini', 'Wipro', 'Infosys', 'TCS', 'SAP', 'Seidor', 'NTT DATA', 'Atos', 'Rizing', 'Grupo Boticario', 'Ambev', 'Petrobras', 'Itau', 'Bradesco', 'Vale', 'Magazine Luiza', 'Natura', 'Embraer', 'Braskem'];

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const pickN = <T>(arr: T[], n: number): T[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  };

  const insertTalent = db.prepare(`INSERT OR IGNORE INTO talents (
    id, full_name, preferred_name, email, phone, linkedin_url, github_url,
    location, state, city, sap_modules, sap_certifications, experience_level,
    years_of_experience, current_role, current_company, skills, languages,
    source, source_details, funnel_stage, engagement_score, points,
    consent_status, data_processing_basis, tags, profile_completeness,
    communication_preference
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const levels: Array<{ level: string; years: [number, number]; roles: string[]; weight: number }> = [
    { level: 'entry', years: [0, 2], roles: ['SAP Trainee', 'SAP Junior Consultant', 'ABAP Developer Jr', 'SAP Intern', 'SAP Associate'], weight: 0.25 },
    { level: 'experienced', years: [3, 7], roles: ['SAP Consultant', 'SAP Developer', 'SAP Functional Analyst', 'ABAP Developer', 'SAP Technical Consultant'], weight: 0.35 },
    { level: 'lead', years: [8, 14], roles: ['SAP Lead Consultant', 'SAP Solution Architect', 'SAP Project Manager', 'SAP Team Lead', 'SAP Practice Lead'], weight: 0.25 },
    { level: 'expert', years: [15, 25], roles: ['SAP Principal Architect', 'SAP Director', 'SAP Distinguished Engineer', 'SAP Practice Director', 'SAP CTO'], weight: 0.15 },
  ];

  const totalTalents = 150; // Meaningful sample
  let talentCount = 0;

  for (const levelDef of levels) {
    const count = Math.round(totalTalents * levelDef.weight);
    for (let i = 0; i < count; i++) {
      const firstName = pick(firstNames);
      const lastName = pick(lastNames);
      const fullName = `${firstName} ${lastName}`;
      const state = pick(brazilStates);
      const city = pick(cities[state]);
      const src = pick(sources);
      const modules = pickN(sapModulesPool, levelDef.level === 'entry' ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 4));
      const yoe = levelDef.years[0] + Math.floor(Math.random() * (levelDef.years[1] - levelDef.years[0]));
      const engagement = Math.floor(Math.random() * 100);
      const stage = pick(funnelStages.slice(0, levelDef.level === 'entry' ? 6 : funnelStages.length));

      insertTalent.run(
        nanoid(),
        fullName,
        firstName,
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}@email.com`,
        `+55${pick(['11','21','31','41','51','71','81'])}9${Math.floor(10000000 + Math.random() * 90000000)}`,
        `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`,
        src.source === 'github' ? `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : null,
        'Brazil',
        state,
        city,
        JSON.stringify(modules),
        JSON.stringify(yoe > 3 ? pickN(['SAP Certified Associate', 'SAP Certified Professional', 'SAP Certified Specialist'], Math.min(yoe > 10 ? 3 : yoe > 5 ? 2 : 1, 3)) : []),
        levelDef.level,
        yoe,
        pick(levelDef.roles),
        pick(companies),
        JSON.stringify([...modules, ...pickN(['JavaScript', 'Python', 'SQL', 'Cloud', 'Agile', 'DevOps', 'Docker', 'REST API'], 2 + Math.floor(Math.random() * 3))]),
        JSON.stringify(['Portuguese', ...(Math.random() > 0.3 ? ['English'] : []), ...(Math.random() > 0.8 ? ['Spanish'] : [])]),
        src.source,
        src.details,
        stage,
        engagement,
        Math.floor(Math.random() * 500),
        pick(['pending', 'granted', 'pending']),
        'legitimate_interest',
        JSON.stringify(pickN(['sap', 'cloud', 'migration', 'development', 'consulting', 'architecture', 'innovation'], 2)),
        Math.floor(30 + Math.random() * 70),
        pick(['email', 'whatsapp', 'linkedin'])
      );
      talentCount++;
    }
  }

  console.log(`Seeded: ${talentCount} talents, ${badges.length} badges, ${challenges.length} challenges, ${contentPieces.length} content pieces, ${templates.length} templates, ${campaigns.length} campaigns`);
  closeDb();
}

seed();
