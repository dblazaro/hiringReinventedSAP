import { useEffect, useState } from 'react';
import {
  Search, Github, Globe, BookOpen, Building2, GraduationCap,
  Users, Mic, Linkedin, Newspaper, ArrowRight, TrendingUp,
  Database, Sparkles
} from 'lucide-react';
import { api } from '../api';

const channelIcons: Record<string, any> = {
  github: Github,
  sap_community: Globe,
  meetup: Users,
  linkedin: Linkedin,
  publication: Newspaper,
  consulting_firm: Building2,
  university: GraduationCap,
  conference: Mic,
};

export default function Sourcing() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('SAP ABAP');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.sourcing.overview().then(res => {
      setOverview(res.data);
      setLoading(false);
    });
  }, []);

  const searchGithub = async () => {
    setSearching(true);
    try {
      const res = await api.sourcing.searchGithub({ query: searchQuery, location: 'Brazil' });
      setSearchResults(res.data);
    } catch (e) {
      console.error(e);
    }
    setSearching(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Search size={24} className="text-primary-500" /> Talent Sourcing Engine
        </h1>
        <p className="text-sm text-gray-500">Multi-channel discovery of SAP professionals across Brazil</p>
      </div>

      {/* Source Statistics */}
      {!loading && overview?.sources && (
        <div className="card">
          <h3 className="font-display font-semibold mb-4">Current Source Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {overview.sources.map((s: any) => (
              <div key={s.source} className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="font-bold text-xl">{s.total}</p>
                <p className="text-xs text-gray-500 capitalize">{s.source.replace('_', ' ')}</p>
                <p className="text-xs text-primary-600 mt-1">Avg: {(s.avg_engagement || 0).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Channels */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">Sourcing Channels</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(overview?.availableChannels || []).map((ch: any) => {
              const Icon = channelIcons[ch.id] || Globe;
              return (
                <div key={ch.id} className="card hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={24} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-display font-semibold">{ch.name}</h3>
                        <span className={`badge ${ch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {ch.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{ch.description}</p>

                      <div className="mt-3">
                        <p className="text-xs text-gray-400 uppercase mb-1">Search Strategies</p>
                        <ul className="space-y-1">
                          {ch.searchStrategies.map((s: string, i: number) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                              <ArrowRight size={10} className="mt-0.5 flex-shrink-0 text-primary-400" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t">
                        <span className="text-sm font-medium text-primary-600 flex items-center gap-1">
                          <Database size={14} /> ~{ch.estimatedPool.toLocaleString()} potential talents
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* GitHub Search Demo */}
      <div className="card border-primary-200">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Github size={20} /> GitHub Talent Discovery
        </h3>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            className="input flex-1"
            placeholder="Search SAP repositories, ABAP code, BTP projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="btn-primary flex items-center gap-2" onClick={searchGithub} disabled={searching}>
            <Search size={16} /> {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-gray-500">Found {searchResults.totalResults} developers matching "{searchResults.query}" in {searchResults.location}</p>
            {searchResults.results.map((r: any) => (
              <div key={r.username} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-mono text-sm">
                  {r.username.substring(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{r.fullName}</p>
                  <p className="text-xs text-gray-500">{r.location} | {r.repos} repos | {r.sapRepos} SAP repos | {r.stars} stars</p>
                  <div className="flex gap-1 mt-1">
                    {r.topLanguages.map((l: string) => (
                      <span key={l} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">{l}</span>
                    ))}
                  </div>
                </div>
                <button className="btn-accent text-sm">Import</button>
              </div>
            ))}
            <p className="text-xs text-gray-400 italic">{searchResults.note}</p>
          </div>
        )}
      </div>

      {/* Innovation Box */}
      <div className="card bg-gradient-to-r from-primary-50 to-sap-blue/5 border-primary-200">
        <h3 className="font-display font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="text-primary-600" size={20} /> AI-Powered Sourcing Intelligence
        </h3>
        <p className="text-sm text-gray-600">
          TalentFlow uses AI to continuously discover SAP professionals across multiple channels.
          The system analyzes GitHub contributions, SAP Community activity, conference participation,
          and publication patterns to identify high-potential candidates before they appear on
          traditional job boards. Combined with Accenture's market intelligence and SAP partnership
          data, this creates a unique talent pipeline that competitors cannot access.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="badge bg-primary-100 text-primary-700">GitHub API Integration</span>
          <span className="badge bg-primary-100 text-primary-700">SAP Community Scraping</span>
          <span className="badge bg-primary-100 text-primary-700">Event Participant Matching</span>
          <span className="badge bg-primary-100 text-primary-700">Publication Analysis</span>
          <span className="badge bg-primary-100 text-primary-700">Network Graph Analysis</span>
        </div>
      </div>
    </div>
  );
}
