import { useEffect, useState } from 'react';
import {
  FileText, BookOpen, Video, Globe, Award, Filter,
  ExternalLink, Star, TrendingUp, Building2
} from 'lucide-react';
import { api } from '../api';

const typeIcons: Record<string, any> = {
  article: FileText,
  video: Video,
  webinar: Globe,
  case_study: BookOpen,
  whitepaper: FileText,
  course: Award,
  event: Star,
};

const typeColors: Record<string, string> = {
  article: 'bg-blue-100 text-blue-600',
  video: 'bg-red-100 text-red-600',
  webinar: 'bg-green-100 text-green-600',
  case_study: 'bg-purple-100 text-purple-600',
  whitepaper: 'bg-indigo-100 text-indigo-600',
  course: 'bg-amber-100 text-amber-600',
  event: 'bg-pink-100 text-pink-600',
};

export default function ContentHub() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', source: '', accentureOnly: '' });

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filter.type) params.type = filter.type;
    if (filter.source) params.source = filter.source;
    if (filter.accentureOnly) params.accentureOnly = filter.accentureOnly;

    api.content.list(params).then(res => {
      setContent(res.data || []);
      setLoading(false);
    });
  }, [filter]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Content Hub</h1>
          <p className="text-sm text-gray-500">Curated content for talent engagement - Accenture, SAP, Udacity, and community</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="select w-auto" value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}>
          <option value="">All Types</option>
          {['article', 'video', 'webinar', 'case_study', 'whitepaper', 'course', 'event'].map(t => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
        <select className="select w-auto" value={filter.source} onChange={e => setFilter({ ...filter, source: e.target.value })}>
          <option value="">All Sources</option>
          {['accenture', 'sap', 'udacity', 'sap_community'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <button
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1 ${filter.accentureOnly === 'true' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300'}`}
          onClick={() => setFilter({ ...filter, accentureOnly: filter.accentureOnly === 'true' ? '' : 'true' })}
        >
          <Building2 size={14} /> Accenture Only
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map(c => {
            const Icon = typeIcons[c.type] || FileText;
            return (
              <div key={c.id} className="card hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[c.type] || 'bg-gray-100'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex items-center gap-2">
                    {c.isAccentureAsset && (
                      <span className="badge bg-primary-100 text-primary-700">Accenture</span>
                    )}
                    <span className={`badge ${typeColors[c.type] || 'bg-gray-100 text-gray-600'}`}>
                      {c.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h3 className="font-display font-semibold group-hover:text-primary-600 transition-colors">{c.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.summary}</p>

                {(c.sapModules || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {c.sapModules.map((m: string) => (
                      <span key={m} className="text-xs px-1.5 py-0.5 bg-sap-blue/10 text-sap-blue rounded">{m.replace('SAP ', '')}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="capitalize">{c.source.replace('_', ' ')}</span>
                    <span>|</span>
                    <span className="capitalize">{c.experienceLevel || c.experience_level}</span>
                  </div>
                  {c.url && (
                    <a href={c.url} target="_blank" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
                      View <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <TrendingUp size={12} />
                  <span>{c.engagementCount || c.engagement_count || 0} engagements</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
