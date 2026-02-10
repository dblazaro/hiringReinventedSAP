import { useEffect, useState } from 'react';
import {
  Plus, Send, Pause, Play, BarChart2, Users, Mail,
  ChevronDown, MessageSquare, Target, Zap
} from 'lucide-react';
import { api } from '../api';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '', description: '', channel: 'email',
    targetExperienceLevels: [] as string[], targetSapModules: [] as string[],
  });

  useEffect(() => {
    api.campaigns.list().then(res => {
      setCampaigns(res.data || []);
      setLoading(false);
    });
  }, []);

  const createCampaign = async () => {
    await api.campaigns.create(newCampaign);
    const res = await api.campaigns.list();
    setCampaigns(res.data || []);
    setShowCreate(false);
    setNewCampaign({ name: '', description: '', channel: 'email', targetExperienceLevels: [], targetSapModules: [] });
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await api.campaigns.update(id, { status: newStatus });
    const res = await api.campaigns.list();
    setCampaigns(res.data || []);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Campaigns</h1>
          <p className="text-sm text-gray-500">Manage multi-step outreach campaigns for SAP talents</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {/* Create Campaign Form */}
      {showCreate && (
        <div className="card border-primary-200 animate-fade-in">
          <h3 className="font-display font-semibold mb-4">Create New Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Campaign Name</label>
              <input type="text" className="input" value={newCampaign.name} onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })} placeholder="e.g., S/4HANA Experts - Wave 2" />
            </div>
            <div>
              <label className="label">Channel</label>
              <select className="select" value={newCampaign.channel} onChange={e => setNewCampaign({ ...newCampaign, channel: e.target.value })}>
                <option value="email">Email</option>
                <option value="linkedin">LinkedIn</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input" rows={2} value={newCampaign.description} onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })} placeholder="Campaign objective and strategy..." />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn-primary" onClick={createCampaign} disabled={!newCampaign.name}>Create Campaign</button>
          </div>
        </div>
      )}

      {/* Campaign Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Send size={48} className="mx-auto mb-4 opacity-50" />
          <p>No campaigns yet. Create your first campaign to start reaching SAP talents.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(c => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold">{c.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                </div>
                <span className={`badge ${statusColors[c.status]}`}>{c.status}</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 my-4">
                <MetricBlock label="Targets" value={c.totalTargets || c.total_targets || 0} icon={Users} />
                <MetricBlock label="Sent" value={c.sent || 0} icon={Send} />
                <MetricBlock label="Responded" value={c.responded || 0} icon={MessageSquare} />
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Delivery Progress</span>
                  <span>{c.totalTargets ? Math.round(((c.sent || 0) / c.totalTargets) * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-sap-blue rounded-full transition-all"
                    style={{ width: `${c.totalTargets ? ((c.sent || 0) / c.totalTargets) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Response rate */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm">
                  <span className="text-gray-500">Response Rate: </span>
                  <span className="font-semibold text-primary-600">
                    {c.sent > 0 ? ((c.responded / c.sent) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Channel: </span>
                  <span className="font-medium capitalize">{c.channel}</span>
                </div>
              </div>

              {/* Steps */}
              {(c.steps || []).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">Campaign Steps</p>
                  <div className="flex items-center gap-2">
                    {c.steps.map((step: any, i: number) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-xs px-2 py-1 bg-primary-50 text-primary-600 rounded">{step.name}</span>
                        {i < c.steps.length - 1 && <ChevronDown size={12} className="text-gray-300 rotate-[-90deg]" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <button
                  className={`flex-1 ${c.status === 'active' ? 'btn-secondary' : 'btn-accent'} flex items-center justify-center gap-1 text-sm`}
                  onClick={() => toggleStatus(c.id, c.status)}
                >
                  {c.status === 'active' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Activate</>}
                </button>
                <button className="btn-secondary flex items-center justify-center gap-1 text-sm">
                  <BarChart2 size={14} /> Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricBlock({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="text-center p-2 bg-gray-50 rounded-lg">
      <Icon size={16} className="mx-auto text-gray-400 mb-1" />
      <p className="text-lg font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
