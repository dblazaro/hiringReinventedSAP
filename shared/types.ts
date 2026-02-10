// ============================================================
// TalentFlow SAP - Shared Type Definitions
// ============================================================

// --- Talent / Candidate ---
export type ExperienceLevel = 'entry' | 'experienced' | 'lead' | 'expert';
export type TalentSource =
  | 'github' | 'meetup' | 'linkedin' | 'publication'
  | 'consulting_firm' | 'sap_community' | 'conference'
  | 'university' | 'referral' | 'manual' | 'import';

export type FunnelStage =
  | 'discovered' | 'enriched' | 'outreach_ready'
  | 'contacted' | 'engaged' | 'responded'
  | 'screening' | 'interviewing' | 'offer' | 'hired' | 'declined';

export type ConsentStatus = 'pending' | 'granted' | 'revoked' | 'not_required';

export interface Talent {
  id: string;
  fullName: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  location: string;
  state?: string;
  city?: string;

  // SAP Profile
  sapModules: string[];          // e.g., ['SAP S/4HANA', 'SAP BTP', 'SAP ABAP']
  sapCertifications: string[];
  experienceLevel: ExperienceLevel;
  yearsOfExperience?: number;
  currentRole?: string;
  currentCompany?: string;
  skills: string[];
  languages: string[];

  // Sourcing
  source: TalentSource;
  sourceDetails?: string;        // e.g., specific GitHub repo, meetup name
  discoveredAt: string;

  // Engagement
  funnelStage: FunnelStage;
  engagementScore: number;       // 0-100
  interestSignals: InterestSignal[];

  // Gamification
  profileCompleteness: number;   // 0-100
  challengesCompleted: string[];
  badgesEarned: string[];
  points: number;

  // LGPD Compliance
  consentStatus: ConsentStatus;
  consentDate?: string;
  dataProcessingBasis: string;   // 'legitimate_interest' | 'consent' | etc.

  // Personalization
  personalityInsights?: PersonalityInsight;
  contentPreferences: string[];
  communicationPreference?: 'email' | 'whatsapp' | 'linkedin' | 'sms';
  bestContactTime?: string;

  // Metadata
  tags: string[];
  notes: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalityInsight {
  communicationStyle: 'formal' | 'casual' | 'technical' | 'visionary';
  motivators: string[];          // e.g., ['career_growth', 'innovation', 'compensation']
  decisionStyle: 'analytical' | 'intuitive' | 'collaborative' | 'directive';
  contentAffinity: string[];     // topics they engage with
}

export interface InterestSignal {
  type: string;
  source: string;
  value: string;
  detectedAt: string;
  strength: number;  // 0-1
}

// --- Outreach Campaign ---
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type MessageChannel = 'email' | 'linkedin' | 'whatsapp' | 'sms' | 'sap_community';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  targetExperienceLevels: ExperienceLevel[];
  targetSapModules: string[];
  targetLocations: string[];
  channel: MessageChannel;

  // Sequence
  steps: CampaignStep[];

  // Metrics
  totalTargets: number;
  sent: number;
  delivered: number;
  opened: number;
  responded: number;
  engaged: number;

  // Accenture Content Integration
  accentureAssets: string[];     // References to Accenture content/POVs

  createdAt: string;
  updatedAt: string;
}

export interface CampaignStep {
  id: string;
  order: number;
  name: string;
  channel: MessageChannel;
  templateId: string;
  delayDays: number;             // Days after previous step
  condition?: string;            // e.g., 'no_response', 'opened_not_responded'
  aiPersonalization: boolean;
}

// --- Message Templates ---
export interface MessageTemplate {
  id: string;
  name: string;
  channel: MessageChannel;
  subject?: string;
  body: string;
  variables: string[];           // Placeholders like {{firstName}}, {{sapModule}}
  experienceLevel: ExperienceLevel | 'all';
  category: 'initial_outreach' | 'follow_up' | 'value_offer' | 'challenge_invite' | 'content_share' | 'event_invite';

  // Performance
  timesSent: number;
  responseRate: number;
  engagementRate: number;

  createdAt: string;
  updatedAt: string;
}

// --- Gamification ---
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'mini_project' | 'assessment' | 'contribution' | 'referral';
  difficulty: ExperienceLevel;
  sapModule?: string;
  points: number;
  badgeId?: string;
  timeLimit?: number;            // minutes
  content: string;               // JSON content for the challenge
  isActive: boolean;
  completions: number;
  avgScore: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'engagement' | 'community' | 'achievement';
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LeaderboardEntry {
  talentId: string;
  talentName: string;
  points: number;
  rank: number;
  badgeCount: number;
  challengesCompleted: number;
}

// --- Content Hub ---
export interface ContentPiece {
  id: string;
  title: string;
  type: 'article' | 'video' | 'webinar' | 'case_study' | 'whitepaper' | 'course' | 'event';
  source: string;                // 'accenture', 'sap', 'udacity', 'community'
  url?: string;
  summary: string;
  sapModules: string[];
  experienceLevel: ExperienceLevel | 'all';
  tags: string[];
  engagementCount: number;
  isAccentureAsset: boolean;
  publishedAt: string;
  createdAt: string;
}

// --- Analytics ---
export interface DashboardMetrics {
  totalTalents: number;
  talentsByStage: Record<FunnelStage, number>;
  talentsByLevel: Record<ExperienceLevel, number>;
  talentsBySource: Record<string, number>;

  outreachMetrics: {
    totalSent: number;
    responseRate: number;
    engagementRate: number;
    avgTimeToRespond: number;    // hours
  };

  campaignPerformance: {
    activeCampaigns: number;
    bestPerforming: string;
    worstPerforming: string;
  };

  gamificationMetrics: {
    activePlayers: number;
    challengesCompleted: number;
    avgEngagementScore: number;
  };

  weeklyTrend: {
    week: string;
    discovered: number;
    contacted: number;
    responded: number;
    hired: number;
  }[];
}

// --- API Types ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TalentFilters {
  search?: string;
  experienceLevel?: ExperienceLevel[];
  sapModules?: string[];
  funnelStage?: FunnelStage[];
  source?: TalentSource[];
  location?: string;
  minEngagementScore?: number;
  tags?: string[];
  consentStatus?: ConsentStatus[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OutreachGenerationRequest {
  talentId: string;
  campaignId?: string;
  templateId?: string;
  channel: MessageChannel;
  tone?: 'formal' | 'casual' | 'enthusiastic' | 'technical';
  includeAccentureContent?: boolean;
  includeChallenge?: boolean;
  includeContentOffer?: boolean;
}

export interface GeneratedOutreach {
  subject?: string;
  body: string;
  personalizedElements: string[];
  suggestedContentPieces: string[];
  suggestedChallenge?: string;
  estimatedEngagementScore: number;
  lgpdCompliant: boolean;
}
