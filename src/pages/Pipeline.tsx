import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight, ArrowRight } from 'lucide-react';
import { api } from '../api';

const STAGES = [
  { id: 'discovered', label: 'Discovered', color: 'bg-gray-500' },
  { id: 'enriched', label: 'Enriched', color: 'bg-blue-400' },
  { id: 'outreach_ready', label: 'Outreach Ready', color: 'bg-indigo-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { id: 'engaged', label: 'Engaged', color: 'bg-orange-500' },
  { id: 'responded', label: 'Responded', color: 'bg-green-500' },
  { id: 'screening', label: 'Screening', color: 'bg-teal-500' },
  { id: 'interviewing', label: 'Interviewing', color: 'bg-purple-500' },
  { id: 'offer', label: 'Offer', color: 'bg-pink-500' },
  { id: 'hired', label: 'Hired', color: 'bg-emerald-600' },
];

export default function Pipeline() {
  const navigate = useNavigate();
  const [stageData, setStageData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const results: Record<string, any[]> = {};
      for (const stage of STAGES) {
        try {
          const res = await api.talents.list({ funnelStage: stage.id, pageSize: '10' });
          results[stage.id] = res.data || [];
        } catch {
          results[stage.id] = [];
        }
      }
      setStageData(results);
      setLoading(false);
    })();
  }, []);

  const moveTalent = async (talentId: string, newStage: string) => {
    await api.talents.moveStage(talentId, newStage);
    // Refresh
    const results: Record<string, any[]> = {};
    for (const stage of STAGES) {
      try {
        const res = await api.talents.list({ funnelStage: stage.id, pageSize: '10' });
        results[stage.id] = res.data || [];
      } catch {
        results[stage.id] = [];
      }
    }
    setStageData(results);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Hiring Pipeline</h1>
        <p className="text-sm text-gray-500">Kanban view of your SAP talent hiring funnel</p>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(s => (
            <div key={s.id} className="flex-shrink-0 w-64 h-96 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage, si) => {
            const talents = stageData[stage.id] || [];
            return (
              <div key={stage.id} className="flex-shrink-0 w-72">
                {/* Column Header */}
                <div className={`${stage.color} text-white px-3 py-2 rounded-t-xl flex items-center justify-between`}>
                  <span className="font-medium text-sm">{stage.label}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{talents.length}</span>
                </div>

                {/* Cards */}
                <div className="bg-gray-100 rounded-b-xl p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-250px)] overflow-y-auto">
                  {talents.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">No talents</p>
                  ) : talents.map(t => (
                    <div
                      key={t.id}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/talents/${t.id}`)}
                    >
                      <p className="font-medium text-sm">{t.fullName || t.full_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.currentRole || t.current_role}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(t.sapModules || []).slice(0, 2).map((m: string) => (
                          <span key={m} className="text-[10px] px-1.5 py-0.5 bg-sap-blue/10 text-sap-blue rounded">{m.replace('SAP ', '')}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${t.engagementScore || t.engagement_score || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400">{t.engagementScore || t.engagement_score || 0}</span>
                        </div>
                        {si < STAGES.length - 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); moveTalent(t.id, STAGES[si + 1].id); }}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                            title={`Move to ${STAGES[si + 1].label}`}
                          >
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
