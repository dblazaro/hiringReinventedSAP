const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Talents
  talents: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any>(`/talents${qs}`);
    },
    get: (id: string) => request<any>(`/talents/${id}`),
    create: (data: any) => request<any>('/talents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/talents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/talents/${id}`, { method: 'DELETE' }),
    moveStage: (id: string, stage: string) => request<any>(`/talents/${id}/move-stage`, { method: 'POST', body: JSON.stringify({ stage }) }),
    bulkImport: (talents: any[]) => request<any>('/talents/bulk-import', { method: 'POST', body: JSON.stringify({ talents }) }),
  },

  // Campaigns
  campaigns: {
    list: () => request<any>('/campaigns'),
    get: (id: string) => request<any>(`/campaigns/${id}`),
    create: (data: any) => request<any>('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/campaigns/${id}`, { method: 'DELETE' }),
  },

  // Templates
  templates: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any>(`/templates${qs}`);
    },
    get: (id: string) => request<any>(`/templates/${id}`),
    create: (data: any) => request<any>('/templates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Outreach
  outreach: {
    generate: (data: any) => request<any>('/outreach/generate', { method: 'POST', body: JSON.stringify(data) }),
    send: (data: any) => request<any>('/outreach/send', { method: 'POST', body: JSON.stringify(data) }),
    history: (talentId: string) => request<any>(`/outreach/history/${talentId}`),
    bulkSend: (data: any) => request<any>('/outreach/bulk-send', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Gamification
  gamification: {
    challenges: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any>(`/gamification/challenges${qs}`);
    },
    challenge: (id: string) => request<any>(`/gamification/challenges/${id}`),
    submitChallenge: (id: string, data: any) => request<any>(`/gamification/challenges/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
    badges: () => request<any>('/gamification/badges'),
    leaderboard: () => request<any>('/gamification/leaderboard'),
    profile: (talentId: string) => request<any>(`/gamification/profile/${talentId}`),
  },

  // Content
  content: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<any>(`/content${qs}`);
    },
    create: (data: any) => request<any>('/content', { method: 'POST', body: JSON.stringify(data) }),
    recommend: (talentId: string) => request<any>(`/content/recommend/${talentId}`),
  },

  // Analytics
  analytics: {
    dashboard: () => request<any>('/analytics/dashboard'),
    funnel: () => request<any>('/analytics/funnel'),
    sourceEffectiveness: () => request<any>('/analytics/source-effectiveness'),
    levelBreakdown: () => request<any>('/analytics/level-breakdown'),
  },

  // LGPD
  lgpd: {
    overview: () => request<any>('/lgpd/overview'),
    grantConsent: (talentId: string, data: any) => request<any>(`/lgpd/consent/${talentId}/grant`, { method: 'POST', body: JSON.stringify(data) }),
    revokeConsent: (talentId: string, data: any) => request<any>(`/lgpd/consent/${talentId}/revoke`, { method: 'POST', body: JSON.stringify(data) }),
    dsar: (talentId: string) => request<any>(`/lgpd/dsar/${talentId}`),
    erase: (talentId: string) => request<any>(`/lgpd/erase/${talentId}`, { method: 'DELETE' }),
    export: (talentId: string) => request<any>(`/lgpd/export/${talentId}`),
  },

  // Sourcing
  sourcing: {
    overview: () => request<any>('/sourcing/overview'),
    searchGithub: (data: any) => request<any>('/sourcing/search/github', { method: 'POST', body: JSON.stringify(data) }),
    import: (data: any) => request<any>('/sourcing/import', { method: 'POST', body: JSON.stringify(data) }),
  },
};
