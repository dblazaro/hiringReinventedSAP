import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ChevronDown, ChevronUp, Plus, Upload,
  MapPin, Briefcase, Star, MoreVertical, X, Download
} from 'lucide-react';
import { api } from '../api';

const EXPERIENCE_LEVELS = ['entry', 'experienced', 'lead', 'expert'];
const FUNNEL_STAGES = ['discovered', 'enriched', 'outreach_ready', 'contacted', 'engaged', 'responded', 'screening', 'interviewing', 'offer', 'hired', 'declined'];
const SOURCES = ['github', 'meetup', 'linkedin', 'publication', 'consulting_firm', 'sap_community', 'conference', 'university', 'referral', 'manual'];

const levelColors: Record<string, string> = {
  entry: 'bg-blue-100 text-blue-700',
  experienced: 'bg-green-100 text-green-700',
  lead: 'bg-purple-100 text-purple-700',
  expert: 'bg-amber-100 text-amber-700',
};

const stageColors: Record<string, string> = {
  discovered: 'bg-gray-100 text-gray-600',
  enriched: 'bg-blue-50 text-blue-600',
  outreach_ready: 'bg-indigo-50 text-indigo-600',
  contacted: 'bg-yellow-50 text-yellow-700',
  engaged: 'bg-orange-50 text-orange-600',
  responded: 'bg-green-50 text-green-600',
  screening: 'bg-teal-50 text-teal-600',
  interviewing: 'bg-purple-50 text-purple-600',
  offer: 'bg-pink-50 text-pink-600',
  hired: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-50 text-red-600',
};

export default function TalentPool() {
  const navigate = useNavigate();
  const [talents, setTalents] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    experienceLevel: '',
    funnelStage: '',
    source: '',
    location: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: '1',
    pageSize: '20',
  });

  const fetchTalents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      for (const [key, val] of Object.entries(filters)) {
        if (val) params[key] = val;
      }
      const res = await api.talents.list(params);
      setTalents(res.data);
      setMeta(res.meta);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: '1' }));
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Talent Pool</h1>
          <p className="text-sm text-gray-500">{meta.total || 0} SAP professionals in database</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, company, role, or SAP module..."
          className="input pl-10"
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
        />
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <div>
            <label className="label">Experience Level</label>
            <select className="select" value={filters.experienceLevel} onChange={e => updateFilter('experienceLevel', e.target.value)}>
              <option value="">All Levels</option>
              {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Funnel Stage</label>
            <select className="select" value={filters.funnelStage} onChange={e => updateFilter('funnelStage', e.target.value)}>
              <option value="">All Stages</option>
              {FUNNEL_STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Source</label>
            <select className="select" value={filters.source} onChange={e => updateFilter('source', e.target.value)}>
              <option value="">All Sources</option>
              {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input type="text" className="input" placeholder="State or city..." value={filters.location} onChange={e => updateFilter('location', e.target.value)} />
          </div>
          <div>
            <label className="label">Sort By</label>
            <select className="select" value={filters.sortBy} onChange={e => updateFilter('sortBy', e.target.value)}>
              <option value="created_at">Date Added</option>
              <option value="full_name">Name</option>
              <option value="engagement_score">Engagement Score</option>
              <option value="points">Points</option>
            </select>
          </div>
          <div>
            <label className="label">Order</label>
            <select className="select" value={filters.sortOrder} onChange={e => updateFilter('sortOrder', e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button className="btn-secondary" onClick={() => setFilters({ search: '', experienceLevel: '', funnelStage: '', source: '', location: '', sortBy: 'created_at', sortOrder: 'desc', page: '1', pageSize: '20' })}>
              <X size={14} className="inline mr-1" /> Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Talent Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Talent</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Level</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">SAP Modules</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Stage</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Source</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Engagement</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-10 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : talents.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No talents found matching your criteria</td></tr>
              ) : talents.map(t => (
                <tr
                  key={t.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/talents/${t.id}`)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{t.fullName || t.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {t.currentRole || t.current_role} {(t.currentCompany || t.current_company) && `@ ${t.currentCompany || t.current_company}`}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {t.city}, {t.state}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${levelColors[t.experienceLevel || t.experience_level] || ''}`}>
                      {(t.experienceLevel || t.experience_level || '').charAt(0).toUpperCase() + (t.experienceLevel || t.experience_level || '').slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(t.sapModules || []).slice(0, 3).map((m: string) => (
                        <span key={m} className="text-xs px-1.5 py-0.5 bg-sap-blue/10 text-sap-blue rounded">{m.replace('SAP ', '')}</span>
                      ))}
                      {(t.sapModules || []).length > 3 && <span className="text-xs text-gray-400">+{t.sapModules.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${stageColors[t.funnelStage || t.funnel_stage] || ''}`}>
                      {(t.funnelStage || t.funnel_stage || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600 capitalize">{(t.source || '').replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${(t.engagementScore || t.engagement_score || 0) > 60 ? 'bg-green-500' : (t.engagementScore || t.engagement_score || 0) > 30 ? 'bg-yellow-500' : 'bg-red-400'}`}
                          style={{ width: `${t.engagementScore || t.engagement_score || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{t.engagementScore || t.engagement_score || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-primary-600">{t.points || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {((meta.page - 1) * meta.pageSize) + 1}-{Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(meta.totalPages, 10) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters(prev => ({ ...prev, page: String(i + 1) }))}
                  className={`px-3 py-1 rounded text-sm ${meta.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
